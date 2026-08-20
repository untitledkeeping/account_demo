// src/components/common/AlertBanner.tsx
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

export interface AlertBannerProps {
  variant?: 'success' | 'error' | 'warning' | 'info' | 'indigo';
  title: string;
  description?: string;
  badgeText?: string;
  className?: string;
  action?: React.ReactNode;
}

const variantMap: Record<string, 'success' | 'destructive' | 'warning' | 'info' | 'brand'> = {
  success: 'success',
  error: 'destructive',
  warning: 'warning',
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
      variant={variantMap[variant] || 'info'}
      className={className}
    >
      <div className="flex items-center space-x-2.5 min-w-0">
        {getIcon()}
        <div className="min-w-0">
          <AlertTitle>{title}</AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
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
    </Alert>
  );
};

