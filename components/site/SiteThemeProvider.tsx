"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

export type SiteTheme = "light" | "dark";

const STORAGE_KEY = "sandook-theme";

type SiteThemeContextValue = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  toggleTheme: () => void;
};

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  themeListeners.forEach((listener) => listener());
}

function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function getThemeSnapshot(): SiteTheme {
  const theme = document.documentElement.getAttribute("data-site-theme");
  return theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): SiteTheme {
  return "dark";
}

function applyTheme(theme: SiteTheme) {
  document.documentElement.setAttribute("data-site-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#12100e" : "#f7f4ef");
  }

  notifyThemeListeners();
}

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  const setTheme = useCallback((next: SiteTheme) => {
    applyTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = getThemeSnapshot() === "dark" ? "light" : "dark";
    applyTheme(next);
  }, []);

  return (
    <SiteThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);
  if (!context) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }
  return context;
}
