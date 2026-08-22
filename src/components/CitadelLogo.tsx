import React from 'react';

interface CitadelLogoProps {
  variant?: 'light' | 'dark' | 'color';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const CitadelLogo: React.FC<CitadelLogoProps> = ({
  variant = 'color',
  size = 'md',
  className = '',
}) => {
  const logoSrc = '/citadel-logo.jpeg';

  // Sizing for the logo image on navbar
  const sizeClasses = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-14 sm:h-16 w-auto',
    xl: 'h-20 sm:h-24 w-auto',
  }[size];

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="Citadel Group"
        referrerPolicy="no-referrer"
        className={`${sizeClasses} object-contain mix-blend-multiply transition-transform duration-200`}
      />
    </div>
  );
};
