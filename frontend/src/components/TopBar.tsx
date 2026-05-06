'use client';

import React from 'react';
import { SearchIcon, BellIcon } from './Icons';

interface TopBarProps {
  title?: string;
  description?: string;
}

export function TopBar({ title, description }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 glass border-b border-slate-200/60">
      <div className="px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-xl font-semibold text-slate-900 leading-tight truncate">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-sm text-slate-500 mt-0.5 truncate">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-64 pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <BellIcon className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
