import { useState, useEffect, useCallback, useLayoutEffect } from "react";

export type ThemeMode = "OS" | "LIGHT" | "DARK" | null;

export default function useThemeMode(): [
  ThemeMode,
  (themeMode: ThemeMode) => void
] {
  const [themeMode, setThemeMode] = useState<ThemeMode>(null);

  // 테마 적용
  const applyThemeMode = useCallback((isDark: boolean) => {
    if (isDark) {
      document.documentElement.setAttribute("data-mode", "dark");
    } else {
      document.documentElement.removeAttribute("data-mode");
    }
  }, []);

  const getLocalStorageItem = useCallback((): ThemeMode => {
    if (typeof window === "undefined" || !localStorage.themeMode)
      return "OS" as ThemeMode;
    return localStorage.getItem("themeMode")! as ThemeMode;
  }, []);

  useEffect(() => {
    if (themeMode === null) {
      setThemeMode(getLocalStorageItem());
    }
  }, [themeMode, getLocalStorageItem]);

  useEffect(() => {
    // 초기 설정
    if (!themeMode) return;
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
    if (typeof window === "undefined") return;

    // OS 시스템에서 변경할 경우
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.themeMode) {
        applyThemeMode(e.matches);
      }
    };

    darkModeMediaQuery.addEventListener("change", handleChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, [applyThemeMode]);

  return [themeMode, setThemeMode];
}
