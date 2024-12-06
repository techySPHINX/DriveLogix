import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TabsLayout from "./(tabs)/_layout"; // Tab Navigator
import NotFoundScreen from "./+not-found"; // Optional "not found" screen
import { NavigationIndependentTree } from "@react-navigation/core";

const Stack = createNativeStackNavigator();

const AppLayout = () => {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Tab Navigator */}
          <Stack.Screen
            name="Tabs"
            component={TabsLayout}
            options={{ headerShown: false }} // Hides header for tab screens
          />
          {/* Not Found Screen */}
          <Stack.Screen
            name="NotFound"
            component={NotFoundScreen}
            options={{ title: "Page Not Found" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default AppLayout;
