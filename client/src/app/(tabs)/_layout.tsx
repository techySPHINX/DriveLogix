import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminNavigator from "./admin/adminNavigator";
import DriverNavigator from "./driver/driverNavigator";
import Login from "./auth/login";
import LogoutScreen from "./auth/LogoutScreen";
import { useAuth } from "../../context/AuthContext"; // Ensure this is imported
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";

const Tab = createBottomTabNavigator();

const TabsLayout = () => {
  const { user } = useAuth(); // Get user from AuthContext

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
            case "Logout":
              iconName = "log-out-outline";
              break;
            default:
              iconName = "log-in-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "blue", // Active tab color
        tabBarInactiveTintColor: "gray", // Inactive tab color
        headerShown: false,
      })}
    >
      {/* Conditional rendering based on user role */}
      {user?.role === "admin" ? (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ tabBarLabel: "Admin Panel" }}
        />
      ) : user?.role === "driver" ? (
        <Tab.Screen
          name="Driver"
          component={DriverNavigator}
          options={{ tabBarLabel: "Driver Panel" }}
        />
      ) : (
        <Tab.Screen
          name="Login"
          component={Login}
          options={{ tabBarLabel: "Login" }}
        />
      )}
      {/* Logout tab */}
      {user && (
        <Tab.Screen
          name="Logout"
          component={LogoutScreen}
          options={{ tabBarLabel: "Logout" }}
        />
      )}
    </Tab.Navigator>
  );
};

export default TabsLayout;
