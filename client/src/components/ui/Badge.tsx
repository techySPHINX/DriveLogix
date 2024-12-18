import React from "react";
import { View, Text } from "react-native";

// Define badge variant types
type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

// Badge component props
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Variant styles mapping
const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-border text-foreground",
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-black",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  return (
    <View
      className={`
        px-2 py-1 
        rounded-full 
        items-center 
        justify-center 
        ${variantStyles[variant]} 
        ${className}
      `}
    >
      <Text
        className={`
          text-xs 
          font-medium 
          ${variant === "outline" ? "text-muted-foreground" : ""}
        `}
      >
        {children}
      </Text>
    </View>
  );
};

export { Badge };
