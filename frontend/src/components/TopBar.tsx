'use client';

import React from 'react';
import { SearchIcon, BellIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';

interface TopBarProps {
  title?: string;
  description?: string;
}

export function TopBar({ title, description }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>
        </div>
      </div>
    </header>
  );
}
