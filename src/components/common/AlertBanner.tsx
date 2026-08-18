// src/components/common/AlertBanner.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { tokens } from '../../styles/tokens';

export interface AlertBannerProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  title: string;
  description?: string;
  badgeText?: string;
  className?: string;
  action?: React.ReactNode;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  description,
  badgeText,
  className = '',
  action,
}) => {
  const color = tokens.colors[variant];

  const getIcon = () => {
    switch (variant) {
      case 'success': return <CheckCircle2 className={`w-4 h-4 ${color.icon} shrink-0`} />;
      case 'error': return <AlertCircle className={`w-4 h-4 ${color.icon} shrink-0`} />;
      case 'warning': return <AlertTriangle className={`w-4 h-4 ${color.icon} shrink-0`} />;
      case 'indigo': return <ShieldCheck className={`w-4 h-4 ${color.icon} shrink-0`} />;
      default: return <Info className={`w-4 h-4 ${color.icon} shrink-0`} />;
    }
  };

  return (
    <div
      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${color.bg} ${color.border} ${color.text} ${className}`}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {getIcon()}
        <div className="min-w-0">
          <div className="font-bold truncate">{title}</div>
          {description && <div className="text-[11px] opacity-85 mt-0.5">{description}</div>}
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {badgeText && (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/70 border border-current/20">
            {badgeText}
          </span>
        )}
        {action}
      </div>
    </div>
  );
};
