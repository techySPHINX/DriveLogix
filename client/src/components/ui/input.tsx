import React from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { cn } from "../../lib/utils";

interface InputProps extends TextInputProps {
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus:border-primary focus:ring-2 focus:ring-ring",
          className
        )}
        placeholderTextColor="#888"
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
