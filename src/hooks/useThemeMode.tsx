import { useState, useEffect, useCallback, useLayoutEffect } from "react";

export type ThemeMode = "OS" | "LIGHT" | "DARK";

export default function useThemeMode(): [
  ThemeMode,
  (themeMode: ThemeMode) => void
] {
  const getLocalStorageItem = (): ThemeMode => {
    if (!localStorage.themeMode) return "OS" as ThemeMode;
    return localStorage.getItem("themeMode")! as ThemeMode;
  };

  const [themeMode, setThemeMode] = useState<ThemeMode>(getLocalStorageItem());

  // 테마 적용
  const applyThemeMode = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute("data-mode", "dark");
    } else {
      document.documentElement.removeAttribute("data-mode");
    }
  }, []);

  useEffect(() => {
    // ui 에서 변경할 경우
    switch (themeMode) {
      case "OS":
        localStorage.removeItem("themeMode");
        applyThemeMode(
          window.matchMedia("(prefers-color-scheme: dark)").matches
        );
        break;
      case "LIGHT":
        localStorage.setItem("themeMode", "LIGHT");
        applyThemeMode(false);
        break;
      case "DARK":
        localStorage.setItem("themeMode", "DARK");
        applyThemeMode(true);
        break;
    }
  }, [themeMode, applyThemeMode]);

  useLayoutEffect(() => {
    // OS 시스템에서 변경할 경우
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    darkModeMediaQuery.addEventListener("change", (e) => {
      if (!localStorage.themeMode) {
        applyThemeMode(e.matches);
      }
    });
    return () => darkModeMediaQuery.removeEventListener("change", () => {});
  }, [applyThemeMode]);

  return [themeMode, setThemeMode];
}
