// components/ui/Logo.tsx
import React from "react";

interface LogoProps {
  className?: string;
  textClassName?: string;
}

export default function Logo({
  className = "",
  textClassName = "text-2xl",
}: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className={`font-seasons text-brand tracking-wide ${textClassName}`}>
        CEE Studio
      </span>
    </div>
  );
}
