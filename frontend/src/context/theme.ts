import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark'; // o que está realmente aplicado
  setTheme: (theme: Theme) => void;
  initFromStorage: () => void;
}

const STORAGE_KEY = 'theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolve = (theme: Theme): 'light' | 'dark' =>
  theme === 'system' ? getSystemTheme() : theme;

const applyToDom = (resolved: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (resolved === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
};

// Estado inicial idêntico server/client (evita hydration mismatch).
// O ThemeBootstrap aplica o tema correto via useEffect após mount.
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'light',

  setTheme: (theme) => {
    const resolved = resolve(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme);
    }
    applyToDom(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) || 'system';
    const resolved = resolve(stored);
    applyToDom(resolved);
    set({ theme: stored, resolvedTheme: resolved });

    // React a mudanças do sistema operacional quando theme = 'system'
    if (stored === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (get().theme === 'system') {
          const r = getSystemTheme();
          applyToDom(r);
          set({ resolvedTheme: r });
        }
      };
      mq.addEventListener('change', listener);
    }
  },
}));
