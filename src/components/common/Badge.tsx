// src/components/common/Badge.tsx
import React from 'react';
import { Badge as MoonBadge } from '@moondesignsystem/react';

export interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const contextMap: Record<string, 'positive' | 'negative' | 'caution' | 'info' | 'brand'> = {
  success: 'positive',
  error: 'negative',
  warning: 'caution',
  info: 'info',
  indigo: 'brand',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  icon,
  className = '',
}) => {
  return (
    <MoonBadge
      variant="soft"
      context={contextMap[variant] || 'info'}
      className={`inline-flex items-center gap-1 font-semibold ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </MoonBadge>
  );
};

