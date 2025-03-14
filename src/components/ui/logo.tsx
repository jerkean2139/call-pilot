import React from 'react';
import { cn } from '../../lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Custom SVG for the CoreTrack logo - curved path with dot at end */}
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 32 32" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path 
          d="M4 24C4 18 8 8 16 8C24 8 28 16 28 20" 
          stroke="#000000" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
        <circle cx="28" cy="20" r="4" fill="#FF0000" />
      </svg>

      <div className="flex flex-col">
        <span className="font-montserrat text-xl font-bold text-[#FF0000] leading-tight">
          CORETRACK
        </span>
        <span className="font-montserrat text-sm font-normal text-black leading-tight">
          ASSESSMENT
        </span>
      </div>
    </div>
  );
}