import React from "react";
import clsx from "clsx";

const Badge = ({ children, variant = "primary", size = "md", className }) => {
  const variants = {
    primary: "bg-primary-100 text-primary-700 border-primary-200",
    success: "bg-success-100 text-success-700 border-success-200",
    danger: "bg-danger-100 text-danger-700 border-danger-200",
    warning: "bg-warning-100 text-warning-700 border-warning-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const classes = clsx(
    "inline-flex items-center font-medium rounded-full border",
    variants[variant],
    sizes[size],
    className
  );

  return <span className={classes}>{children}</span>;
};

export default Badge;
