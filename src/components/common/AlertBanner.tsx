// src/components/common/AlertBanner.tsx
import React from 'react';
import { Alert } from '@moondesignsystem/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

export interface AlertBannerProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  title: string;
  description?: string;
  badgeText?: string;
  className?: string;
  action?: React.ReactNode;
}

const contextMap: Record<string, 'positive' | 'negative' | 'caution' | 'info' | 'brand'> = {
  success: 'positive',
  error: 'negative',
  warning: 'caution',
  info: 'info',
  indigo: 'brand',
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant = 'info',
  title,
  description,
  badgeText,
  className = '',
  action,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success': return <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />;
      case 'indigo': return <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600" />;
      default: return <Info className="w-4 h-4 shrink-0 text-sky-600" />;
    }
  };

  return (
    <Alert
      variant="soft"
      context={contextMap[variant] || 'info'}
      className={`rounded-xl flex items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {getIcon()}
        <Alert.Content className="min-w-0">
          <div className="font-bold truncate">{title}</div>
          {description && <div className="text-[11px] opacity-85 mt-0.5">{description}</div>}
        </Alert.Content>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {badgeText && (
          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-white/70 border border-current/20">
            {badgeText}
          </span>
        )}
        {action}
      </div>
    </Alert>
  );
};

