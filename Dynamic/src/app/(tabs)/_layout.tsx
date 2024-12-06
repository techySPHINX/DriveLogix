import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./auth/login";
import AdminDashboard from "./admin/dashboard";
import { Ionicons } from "@expo/vector-icons";
import DriverHomeScreen from "./driver/DriverHomeScreen";

const Tab = createBottomTabNavigator();

const TabsLayout = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case "Admin":
              iconName = "settings-outline";
              break;
            case "Driver":
              iconName = "car-outline";
              break;
            case "Auth":
              iconName = "log-in-outline";
              break;
            default:
              return null;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue", // Active tab icon color
        tabBarInactiveTintColor: "gray", // Inactive tab icon color
        headerShown: false, // Hide header for all tabs
      })}
    >
      <Tab.Screen
        name="Admin"
        component={AdminDashboard}
        options={{ tabBarLabel: "Admin Panel" }}
      />
      <Tab.Screen
        name="Driver"
        component={DriverHomeScreen}
        options={{ tabBarLabel: "Driver Screen" }}
      />
      <Tab.Screen
        name="Auth"
        component={Login}
        options={{ tabBarLabel: "Login" }}
      />
    </Tab.Navigator>
  );
};

export default TabsLayout;
