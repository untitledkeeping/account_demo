// src/components/common/Badge.tsx
import React from 'react';
import { Badge as ShadcnBadge } from '../ui/badge';

export interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantMap: Record<string, 'default' | 'destructive' | 'warning' | 'info' | 'brand'> = {
  success: 'default',
  error: 'destructive',
  warning: 'warning',
  info: 'info',
  indigo: 'brand',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  icon,
  className = '',
  size = 'md',
}) => {
  return (
    <ShadcnBadge
      variant={variantMap[variant] || 'info'}
      size={size === 'sm' ? 'sm' : 'default'}
      icon={icon}
      className={className}
    >
      {children}
    </ShadcnBadge>
  );
};

