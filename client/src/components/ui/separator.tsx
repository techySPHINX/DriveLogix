import React from "react";
import { View } from "react-native";
import { cn } from "../../lib/utils";

interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const Separator: React.FC<SeparatorProps> = ({
  orientation = "horizontal",
  className,
}) => (
  <View
    className={cn(
      "bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full",
      className
    )}
  />
);

export { Separator };
