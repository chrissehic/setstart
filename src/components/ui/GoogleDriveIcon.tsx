import React from 'react';

interface GoogleDriveIconProps {
  className?: string;
  size?: number;
}

export const GoogleDriveIcon: React.FC<GoogleDriveIconProps> = ({ 
  className = '', 
  size = 24 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path fill="#FFC107" d="M17 6L31 6 45 30 31 30z"/>
      <path fill="#1976D2" d="M9.875 42L16.938 30 45 30 38 42z"/>
      <path fill="#4CAF50" d="M3 30.125L9.875 42 24 18 17 6z"/>
    </svg>
  );
};
