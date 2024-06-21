"use client";
import Image from "next/image";

import useThemeMode, { type ThemeMode } from "@/hooks/useThemeMode";

import "./style.css";

import Email from "@/assets/email.svg";
import Github from "@/assets/github.svg";
import User from "@/assets/user.svg";

export default function Footer() {
  // values
  const [theme, setTheme] = useThemeMode();

  return (
    <footer className="main-footer">
      <nav className="navbar">
        <div className="theme-mode-wrapper">
          <div className="theme is-light">
            <input
              id="light"
              type="radio"
              value="LIGHT"
              checked={theme === "LIGHT"}
              onChange={(e: any) => {
                setTheme(e.target.value as ThemeMode);
              }}
            />
            <label htmlFor="light">
              <span className="icon">
                <i className="material-icons-outlined md-18">light_mode</i>
              </span>
            </label>
          </div>
          <div className="theme is-os">
            <input
              id="os"
              type="radio"
              value="OS"
              checked={theme === "OS"}
              onChange={(e: any) => {
                setTheme(e.target.value as ThemeMode);
              }}
            />
            <label htmlFor="os">
              <span className="icon">
                <i className="material-icons-outlined md-18">desktop_windows</i>
              </span>
            </label>
          </div>
          <div className="theme is-dark">
            <input
              id="dark"
              type="radio"
              value="DARK"
              checked={theme === "DARK"}
              onChange={(e: any) => {
                setTheme(e.target.value as ThemeMode);
              }}
            />
            <label htmlFor="dark">
              <span className="icon">
                <i className="material-icons-outlined md-18">dark_mode</i>
              </span>
            </label>
          </div>
        </div>
        <div className="links">
          <span className="text-xs fill-gray-300">Created By Junim</span>
          <a href="mailto:dbaudwns20@gmail.com">
            <Image src={Email} alt="Email" width={20} height={20} priority />
          </a>
          <a
            href="https://github.com/dbaudwns20/WTS-Web-Editor"
            target="_blank"
          >
            <Image src={Github} alt="Github" width={20} height={20} priority />
          </a>
          <a href="https://github.com/dbaudwns20" target="_blank">
            <Image src={User} alt="User" width={20} height={20} priority />
          </a>
        </div>
      </nav>
    </footer>
  );
}
