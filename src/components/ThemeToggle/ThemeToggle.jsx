import React from "react";
import { useTheme } from "contexts/ThemeContext";
import "./ThemeToggle.css";
import { PiMoonFill, PiSunFill } from "react-icons/pi";

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      className={`toggle-switch ${darkMode ? "dark" : ""}`}
      onClick={() => setDarkMode(prev => !prev)}
      title={darkMode ? "Modo oscuro" : "Modo claro"}
      aria-label="Cambiar tema"
    >
      <span className="icon left">{darkMode && <PiMoonFill size={20} />}</span>
      <div className="slider">
        <div className="circle" />
      </div>
      <span className="icon right">{!darkMode && <PiSunFill size={20} />}</span>
    </button>
  );
}