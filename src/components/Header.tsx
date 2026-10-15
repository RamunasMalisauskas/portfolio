type Theme = "light" | "dark";

type HeaderProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

function Header({ theme, onToggleTheme }: HeaderProps) {
  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <header className="site-header">
      <nav className="main-nav" aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
      <button
        className="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${nextTheme} theme`}
        title={`Switch to ${nextTheme} theme`}
      >
        {theme === "light" ? (
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path
              d="M17 12.1A7.2 7.2 0 0 1 7.9 3a7.2 7.2 0 1 0 9.1 9.1Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="3.4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10 1.8v1.5m0 13.4v1.5M18.2 10h-1.5M3.3 10H1.8m14-5.8-1.1 1.1M5.3 14.7l-1.1 1.1m11.6 0-1.1-1.1M5.3 5.3 4.2 4.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </header>
  );
}

export default Header;
