import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = "", size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="currentColor"
        strokeWidth="4.5"
        fill="none"
      />
      {/* Inscribed 5-pointed Star (Pentagram) */}
      <path
        d="M50 5 L76.5 86.4 L7.2 36.1 L92.8 36.1 L23.5 86.4 Z"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="miter"
        fill="none"
      />
    </svg>
  );
}

