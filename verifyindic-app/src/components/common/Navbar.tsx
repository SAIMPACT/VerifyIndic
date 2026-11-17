import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    closeMenu();
    const el = document.getElementById(targetId);
    if (el) {
      e.preventDefault();
      el.scrollIntoView();
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Brand to="/" />

        <button
          className="nav__toggle"
          aria-expanded={isOpen}
          aria-controls="navLinks"
          aria-label="Toggle menu"
          onClick={toggleMenu}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="navLinks"
          className={`nav__links ${isOpen ? "is-open" : ""}`}
          aria-label="Main"
        >
          <a href="#how" onClick={(e) => handleAnchorClick(e, "how")}>
            How it works
          </a>
          <a href="#languages" onClick={(e) => handleAnchorClick(e, "languages")}>
            Languages
          </a>
          <a href="#pricing" onClick={(e) => handleAnchorClick(e, "pricing")}>
            Pricing
          </a>
          <a href="#docs" onClick={(e) => handleAnchorClick(e, "docs")}>
            Docs
          </a>
          <div className="nav__actions">
            <Link
              to="/login"
              className="btn btn--ghost"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link to="/signup" className="btn btn--primary" onClick={closeMenu}>
              Sign up
            </Link>
            <a
              href="#access"
              className="btn btn--ghost"
              onClick={(e) => handleAnchorClick(e, "access")}
            >
              Request access
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

