import React from 'react';

/**
 * Official Gardenia Floral Emblem Logo Component for Olor Gardenia
 */
export const GardeniaIcon: React.FC<{ className?: string }> = ({ className = "w-full h-full" }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} filter drop-shadow-[0_0_8px_rgba(242,202,80,0.85)] scale-110`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Central core bud */}
      <circle cx="12" cy="12" r="2.4" fill="currentColor" fillOpacity="0.9" />
      {/* Cardinal Gardenia Petals */}
      <path d="M12 1.5C9.2 4.2 9.2 7.6 12 10.4C14.8 7.6 14.8 4.2 12 1.5Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M22.5 12C19.8 9.2 16.4 9.2 13.6 12C16.4 14.8 19.8 14.8 22.5 12Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M12 22.5C14.8 19.8 14.8 16.4 12 13.6C9.2 16.4 9.2 19.8 12 22.5Z" fill="currentColor" fillOpacity="0.35" />
      <path d="M1.5 12C4.2 14.8 7.6 14.8 10.4 12C7.6 9.2 4.2 9.2 1.5 12Z" fill="currentColor" fillOpacity="0.35" />
      {/* Diagonal Overlapping Petals */}
      <path d="M4.5 4.5C7.2 5.1 8.8 7.0 8.5 9.8C5.7 9.5 3.8 7.9 4.5 4.5Z" fill="currentColor" fillOpacity="0.45" />
      <path d="M19.5 4.5C18.9 7.2 17.0 8.8 14.2 8.5C14.5 5.7 16.1 3.8 19.5 4.5Z" fill="currentColor" fillOpacity="0.45" />
      <path d="M19.5 19.5C16.8 18.9 15.2 17.0 15.5 14.2C18.3 14.5 20.2 16.1 19.5 19.5Z" fill="currentColor" fillOpacity="0.45" />
      <path d="M4.5 19.5C5.1 16.8 7.0 15.2 9.8 15.5C9.5 18.3 7.9 20.2 4.5 19.5Z" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
};

// Aliased export for backwards compatibility across components
export const LotusIcon = GardeniaIcon;
export default GardeniaIcon;

