import React from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps extends CardProps {}
interface CardTitleProps extends CardProps {}
interface CardContentProps extends CardProps {}
interface CardFooterProps extends CardProps {}

const Card: React.FC<CardProps> = ({ children, className }) => (
  <View
    className={cn(
      "rounded-xl border border-border bg-card p-4 shadow-md",
      className
    )}
  >
    {children}
  </View>
);

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
  <View className={cn("flex flex-col space-y-1.5 p-2", className)}>
    {children}
  </View>
);

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
  <Text className={cn("text-lg font-semibold text-card-foreground", className)}>
    {children}
  </Text>
);

const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <View className={cn("p-2 pt-0", className)}>{children}</View>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <View className={cn("flex flex-row items-center p-2 pt-0", className)}>
    {children}
  </View>
);

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
