import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500',
          'focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none',
          'transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed',
          error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
          className
        )}
        {...props}
      />
      {error && <span className="text-sm text-danger-600">{error}</span>}
      {helpText && !error && <span className="text-sm text-gray-500">{helpText}</span>}
    </div>
  );
}
