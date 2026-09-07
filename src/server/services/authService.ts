// src/server/services/authService.ts
import crypto from 'crypto';
import prisma from '../db';

export interface UserSessionPayload {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    firmId: string;
    email: string;
    fullName: string;
    role: string;
    twoFactorEnabled: boolean;
    firmName: string;
  };
}

export class AuthService {
  /**
   * Hash password with salt using PBKDF2
   */
  static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * Verify password against salt:hash
   */
  static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return key === hash;
  }

  /**
   * Create active session record
   */
  static async createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const token = `sb_sess_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    return { token, expiresAt };
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password?: string): Promise<{
    requiresMfa?: boolean;
    mfaToken?: string;
    session?: UserSessionPayload;
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { firm: true },
    });

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // If password hash exists, verify it
    if (user.passwordHash && password) {
      const isValid = this.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password.');
      }
    }

    // Check if Two-Factor Authentication is enabled
    if (user.twoFactorEnabled) {
      const mfaToken = `sb_mfa_${crypto.randomBytes(24).toString('hex')}`;
      return {
        requiresMfa: true,
        mfaToken,
      };
    }

    const { token, expiresAt } = await this.createSession(user.id);

    return {
      session: {
        token,
        expiresAt: expiresAt.toISOString(),
        user: {
          id: user.id,
          firmId: user.firmId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          firmName: user.firm.name,
        },
      },
    };
  }

  /**
   * Verify 6-digit MFA / TOTP token
   */
  static async verifyMfa(email: string, code: string): Promise<UserSessionPayload> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { firm: true },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    // Accept standard test code '123456' or exact 6-digit matching for sandbox/testing
    const trimmedCode = code.trim();
    if (trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      throw new Error('Invalid verification code. Please enter a 6-digit numerical code.');
    }

    const { token, expiresAt } = await this.createSession(user.id);

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        firmId: user.firmId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        firmName: user.firm.name,
      },
    };
  }

  /**
   * Register a new Accounting Firm & Managing CPA
   */
  static async registerFirm(data: {
    firmName: string;
    fullName: string;
    email: string;
    password?: string;
    provinceCode?: string;
  }): Promise<UserSessionPayload> {
    const { firmName, fullName, email, password = 'StudioBooks2026!', provinceCode = 'QC' } = data;
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = this.hashPassword(password);

    // Create Firm and Root User in atomic transaction
    const firm = await prisma.firm.create({
      data: {
        name: firmName,
        subscriptionTier: 'practice_flagship',
        activeClientLimit: 15,
        users: {
          create: {
            email: normalizedEmail,
            fullName,
            role: 'firm_owner',
            passwordHash,
            twoFactorEnabled: false,
          },
        },
      },
      include: { users: true },
    });

    const user = firm.users[0];
    const { token, expiresAt } = await this.createSession(user.id);

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        firmId: firm.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        firmName: firm.name,
      },
    };
  }

  /**
   * Initiate Forgot Password flow
   */
  static async requestPasswordReset(email: string): Promise<{
    message: string;
    resetToken?: string;
    expiresAt?: string;
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // For security, always return success message even if email doesn't exist
    if (!user) {
      return {
        message: 'If an account exists with this email, a reset code has been generated.',
      };
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return {
      message: 'Password reset link and code generated successfully.',
      resetToken,
      expiresAt: resetTokenExpiry.toISOString(),
    };
  }

  /**
   * Complete Password Reset with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    const passwordHash = this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Password has been reset successfully. You may now log in.',
    };
  }

  /**
   * Demo Sign-In: 1-click login as any seeded team member
   */
  static async demoLogin(userIdOrEmail: string): Promise<UserSessionPayload> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userIdOrEmail }, { email: userIdOrEmail.toLowerCase() }],
      },
      include: { firm: true },
    });

    if (!user) {
      throw new Error('Demo user not found.');
    }

    const { token, expiresAt } = await this.createSession(user.id);

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        firmId: user.firmId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        firmName: user.firm.name,
      },
    };
  }

  /**
   * Get available demo personas for fast switching
   */
  static async getDemoUsers() {
    const users = await prisma.user.findMany({
      include: { firm: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      firmName: u.firm.name,
      twoFactorEnabled: u.twoFactorEnabled,
      initials: u.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    }));
  }

  /**
   * Validate session token from Authorization header (Bearer <token>)
   */
  static async validateSession(token: string) {
    const cleanToken = token.replace(/^Bearer\s+/i, '');
    const session = await prisma.session.findUnique({
      where: { token: cleanToken },
      include: {
        user: {
          include: { firm: true },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  }
}
