// src/components/common/Badge.tsx
import React from 'react';
import { tokens } from '../../styles/tokens';

export interface BadgeProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  icon,
  className = '',
  size = 'md',
}) => {
  const colorClass = tokens.colors[variant].badge;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1 font-bold rounded-full border ${colorClass} ${sizeClass} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
