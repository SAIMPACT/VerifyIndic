import React from "react";
import { Link } from "react-router-dom";

interface BrandProps {
  to?: string;
  className?: string;
  showPlaceholder?: boolean;
}

export const Brand: React.FC<BrandProps> = ({ to = "/", className = "", showPlaceholder = false }) => {
  return (
    <Link to={to} className={`brand ${className}`} aria-label="VerifyIndic home">
      <span className="brand__dot" aria-hidden="true" />
      VerifyIndic
      {showPlaceholder && <span className="brand__tag">placeholder</span>}
    </Link>
  );
};

