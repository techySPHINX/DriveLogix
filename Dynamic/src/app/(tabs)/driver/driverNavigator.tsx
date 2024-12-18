// src/app/(tabs)/driver/driverNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import StatusScreen from "./StatusScreen";
import TripScreen from "./Tripscreen";
import DriverHomeScreen from "./DriverHomeScreen";
import DriverLocationScreen from "../admin/DriverLocationScreen";

const Tab = createBottomTabNavigator();

const DriverNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="DriverHomeScreen"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Assign icons to each route
          switch (route.name) {
            case "StatusScreen":
              iconName = "pulse-outline";
              break;
            case "TripScreen":
              iconName = "car-outline";
              break;
            case "DriverHomeScreen":
              iconName = "home-outline";
              break;
            case "DriverLocationScreen":
              iconName = "navigate-outline";
              break;
            default:
              iconName = "help-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "green", // Active tab icon color
        tabBarInactiveTintColor: "gray", // Inactive tab icon color
        headerShown: true, // Display headers for individual screens
      })}
    >
      {/* Driver Home Screen */}
      <Tab.Screen
        name="DriverHomeScreen"
        component={DriverHomeScreen}
        options={{ tabBarLabel: "Home", headerShown: false }}
      />

      {/* Status Screen */}
      <Tab.Screen
        name="StatusScreen"
        component={StatusScreen}
        options={{ tabBarLabel: "Status", headerShown: false }}
      />

      {/* Trip Screen */}
      <Tab.Screen
        name="TripScreen"
        component={TripScreen}
        options={{ tabBarLabel: "Trips", headerShown: false }}
      />

      {/* Driver Location Screen */}
      <Tab.Screen
        name="DriverLocationScreen"
        component={DriverLocationScreen}
        options={{ tabBarLabel: "Location", headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
