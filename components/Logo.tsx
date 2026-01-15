
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="20" fill="#065f46" />
    <path d="M50 20L20 45V80H40V60H60V80H80V45L50 20Z" fill="white" fillOpacity="0.2" />
    <path d="M35 50H65M50 35V65" stroke="white" strokeWidth="8" strokeLinecap="round" />
    <circle cx="50" cy="50" r="10" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 4" />
  </svg>
);

export default Logo;
