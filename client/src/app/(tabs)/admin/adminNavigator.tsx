import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminStack from "./dashboard";
import TripManagementScreen from "./TripManagementScreen";
import GeoFenceManagementScreen from "./GeoFenceManageMent";
import CreateTripScreen from "./CreateTripScreen"; // Ensure CreateTripScreen is a valid React component
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverLocationScreen from "./DriverLocationScreen";
import LogoutScreen from "../auth/LogoutScreen";

const Tab = createBottomTabNavigator();

const AdminNavigator = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={{
      headerShown: false, // Optional: If you want to hide the header in all screens.
      tabBarStyle: { backgroundColor: "#f8f9fa" }, // Optional: To customize the tab bar.
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={AdminStack}
      options={{
        tabBarLabel: "Dashboard",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="view-dashboard"
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Create Trip"
      component={CreateTripScreen}
      options={{
        tabBarLabel: "Create Trip",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="plus-circle"
            color={color}
            size={size}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Geofence Management"
      component={GeoFenceManagementScreen}
      options={{
        tabBarLabel: "Geofence",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="map-marker-radius"
            color={color}
            size={size}
          />
        ),
      }}
    />
    
    <Tab.Screen
      name="Trip Management"
      component={TripManagementScreen}
      options={{
        tabBarLabel: "Trip Management",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="car" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Logout"
      component={LogoutScreen}
      options={{
        tabBarLabel: "Log out",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="logout" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
);

export default AdminNavigator;
