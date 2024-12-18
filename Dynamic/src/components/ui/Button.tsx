import React from "react";
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  View,
} from "react-native";
import { cn } from "../../lib/utils";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
  className?: string;
}

const Button = React.forwardRef<View, ButtonProps>(
  (
    { variant = "default", size = "default", children, className, ...props },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        className={cn(
          "flex flex-row items-center justify-center rounded-md",
          // Default variant
          variant === "default" && "bg-primary",
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-8 px-3 rounded-md",
          size === "lg" && "h-12 px-8 rounded-md",
          // Additional styling
          "active:opacity-80",
          className
        )}
        {...props}
      >
        {typeof children === "string" ? (
          <Text
            className={cn(
              "text-primary-foreground text-sm font-medium",
              variant === "outline" && "text-primary",
              variant === "secondary" && "text-secondary-foreground",
              variant === "destructive" && "text-destructive-foreground",
              variant === "ghost" && "text-primary"
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = "Button";

export { Button };
