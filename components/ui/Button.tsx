"use client";

import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "filled" | "outlined" | "outlined-white";
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "filled",
  href,
  onClick,
  className = "",
  type = "button",
  fullWidth = false,
}: ButtonProps) {
  const base =
    "inline-block px-8 py-3 text-sm uppercase tracking-widest font-sans transition-all duration-500";

  const variants = {
    filled:
      "bg-brand text-background hover:bg-brand-hover",
    outlined:
      "border border-brand text-brand hover:bg-brand hover:text-background",
    "outlined-white":
      "border border-background text-background hover:bg-background hover:text-brand",
  };

  const classes = `${base} ${variants[variant]} ${fullWidth ? "w-full text-center" : ""} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
