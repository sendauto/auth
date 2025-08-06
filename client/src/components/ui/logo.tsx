import React from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "default" | "white" | "dark";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-12 w-12",
  xl: "h-16 w-16"
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl", 
  xl: "text-3xl"
};

export function Logo({ 
  className, 
  size = "md", 
  showText = true, 
  variant = "default" 
}: LogoProps) {
  const logoVariants = {
    default: "bg-primary text-primary-foreground",
    white: "bg-white text-primary",
    dark: "bg-gray-900 text-white"
  };

  const textVariants = {
    default: "text-foreground",
    white: "text-white",
    dark: "text-gray-900"
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Logo Icon */}
      <div className={cn(
        "rounded-lg flex items-center justify-center",
        sizeClasses[size],
        logoVariants[variant]
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className={cn(
            size === "sm" ? "h-3 w-3" :
            size === "md" ? "h-4 w-4" :
            size === "lg" ? "h-6 w-6" : "h-8 w-8"
          )}
        >
          {/* Auth247 Logo - Stylized Shield with 247 */}
          <path d="M12 2C13.1 2 14 2.9 14 4V5H20C20.6 5 21 5.4 21 6V20C21 20.6 20.6 21 20 21H4C3.4 21 3 20.6 3 20V6C3 5.4 3.4 5 4 5H10V4C10 2.9 10.9 2 12 2ZM12 4C11.4 4 11 4.4 11 5V6H13V5C13 4.4 12.6 4 12 4Z"/>
          <path d="M8 10H9V12H8V10ZM11 10H16V11H11V10ZM11 13H16V14H11V13ZM8 15H9V17H8V15ZM11 16H16V17H11V16Z"/>
          {/* "247" integrated into shield design */}
          <text x="12" y="15" textAnchor="middle" fontSize="4" fontWeight="bold" fill="currentColor">247</text>
        </svg>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          textSizeClasses[size],
          textVariants[variant]
        )}>
          Auth247
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  return <Logo className={className} size={size} showText={false} />;
}

export function LogoText({ className, size = "md", variant = "default" }: { 
  className?: string; 
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "dark";
}) {
  return (
    <span className={cn(
      "font-bold tracking-tight",
      textSizeClasses[size],
      variant === "white" ? "text-white" :
      variant === "dark" ? "text-gray-900" : "text-foreground",
      className
    )}>
      Auth247
    </span>
  );
}