import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminDashboard from "./dashboard";
import TripManagementScreen from "./TripManagementScreen";
import GeofenceManagementScreen from "./GeoFenceManageMent";
import CreateTripScreen from "./CreateTripScreen";
import { MaterialCommunityIcons } from "react-native-vector-icons";

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
      component={AdminDashboard}
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
      component={GeofenceManagementScreen}
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
  </Tab.Navigator>
);

export default AdminNavigator;
