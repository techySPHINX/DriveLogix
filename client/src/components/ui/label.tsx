import React from "react";
import { Text, TextProps } from "react-native";
import { cn } from "../../lib/utils";

interface LabelProps extends TextProps {
  className?: string;
}

const Label: React.FC<LabelProps> = ({ children, className, ...props }) => (
  <Text
    className={cn("text-sm font-medium text-foreground mb-2", className)}
    {...props}
  >
    {children}
  </Text>
);

export { Label };
