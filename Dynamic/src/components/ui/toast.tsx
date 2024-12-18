import React, { createContext, useState, useContext } from "react";
import { View, Text } from "react-native";
import { cn } from "../../lib/utils";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
    // Auto-dismiss after 3 seconds
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      {toast && (
        <View
          className={cn(
            "absolute bottom-4 left-4 right-4 p-4 rounded-lg",
            toast.variant === "destructive" ? "bg-destructive" : "bg-primary"
          )}
        >
          <Text
            className={cn(
              "text-lg font-semibold",
              toast.variant === "destructive"
                ? "text-destructive-foreground"
                : "text-primary-foreground"
            )}
          >
            {toast.title}
          </Text>
          {toast.description && (
            <Text
              className={cn(
                "text-sm mt-1",
                toast.variant === "destructive"
                  ? "text-destructive-foreground"
                  : "text-primary-foreground"
              )}
            >
              {toast.description}
            </Text>
          )}
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
