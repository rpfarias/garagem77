'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/context/theme';

/**
 * Componente client-only que sincroniza o store Zustand com o tema já aplicado
 * pelo script inline no <head>. O script inline previne flash; este hook
 * garante que o React conheça o estado.
 */
export function ThemeBootstrap() {
  const initFromStorage = useThemeStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  return null;
}

/**
 * Script inline para ser injetado no <head>. Lê o tema do localStorage
 * e aplica a classe `dark` ANTES do React hidratar — previne flash branco
 * em quem prefere dark mode.
 */
export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme') || 'system';
    var isDark =
      stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`.trim();
