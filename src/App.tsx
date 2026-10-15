import { useEffect, useState } from "react";
import About from "./components/About";
import Contact from "./components/Contact";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Work from "./components/Work";
import { waveBackgroundDots } from "./waveDots";
import "./App.css";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem("ramunas-portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark";
  }
}

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const nextTheme = theme === "light" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem("ramunas-portfolio-theme", theme);
    } catch {
      // The selected theme still works for this session if storage is unavailable.
    }
  }, [theme]);

  useEffect(() => {
    const openingTheme = theme;
    const timeout = window.setTimeout(() => {
      waveBackgroundDots(openingTheme, openingTheme);
    }, 1800);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Header
        theme={theme}
        onToggleTheme={() => {
          waveBackgroundDots(theme, nextTheme);
          setTheme(nextTheme);
        }}
      />

      <main id="main">
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
    </>
  );
}

export default App;
