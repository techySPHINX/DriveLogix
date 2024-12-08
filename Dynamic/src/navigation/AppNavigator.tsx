import React from "react";
import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import AdminNavigator from "../app/(tabs)/admin/adminNavigator";
import DriverNavigator from "../app/(tabs)/driver/driverNavigator";
import Login from "../app/(tabs)/auth/login";
import OTPVerification from "../app/(tabs)/auth/otp-verification";
import NotFoundScreen from "../app/+not-found"; // Import the NotFound screen

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth(); // Get the user object from AuthContext

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* If user is authenticated */}
        {user ? (
          user.role === "admin" ? (
            <Stack.Screen name="AdminTabs" component={AdminNavigator} />
          ) : (
            <Stack.Screen name="DriverTabs" component={DriverNavigator} />
          )
        ) : (
          // If no user is authenticated, show Login and OTPVerification
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="OTPVerification" component={OTPVerification} />
          </>
        )}
        {/* Catch all undefined routes and show the NotFoundScreen */}
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
      </Stack.Navigator>
    </NavigationContainer>
   </NavigationIndependentTree>
  )
};
export default AppNavigator;

 

