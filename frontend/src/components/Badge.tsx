import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'default' | 'primary' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'sm', dot = false, children }: BadgeProps) {
  const variantClasses = {
    success: 'bg-success-50 text-success-700 ring-success-200',
    warning: 'bg-warning-50 text-warning-700 ring-warning-200',
    danger: 'bg-danger-50 text-danger-700 ring-danger-200',
    primary: 'bg-primary-50 text-primary-700 ring-primary-200',
    info: 'bg-blue-50 text-blue-700 ring-blue-200',
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  const dotColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    primary: 'bg-primary-500',
    info: 'bg-blue-500',
    default: 'bg-slate-500',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-2xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        variantClasses[variant],
        sizes[size]
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
