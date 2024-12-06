// src/navigation/AppNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import Login from "../app/(tabs)/auth/login";
import OTPVerification from "../app/(tabs)/auth/otp-verification";
import AdminNavigator from "../app/(tabs)/admin/adminNavigator";
import DriverNavigator from "../app/(tabs)/driver/driverNavigator";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === "admin" ? (
            <Stack.Screen name="AdminTabs" component={AdminNavigator} />
          ) : (
            <Stack.Screen name="DriverTabs" component={DriverNavigator} />
          )
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
