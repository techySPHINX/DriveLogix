// src/app/(tabs)/admin/adminNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminDashboard from "./dashboard";
import TripManagementScreen from "./TripManagementScreen";
import GeofenceManagementScreen from "./GeoFenceManageMent";
import  CreateTripScreen  from "./CreateTripScreen";

const Tab = createBottomTabNavigator();

const AdminNavigator = () => (
  <Tab.Navigator initialRouteName="AdminDashboard">
   <Tab.Screen name="Dashboard" component={AdminDashboard} />
    <Tab.Screen name="Create Trip" component={CreateTripScreen} />
    <Tab.Screen name="Geofence Management" component={GeofenceManagementScreen} />
   <Tab.Screen name="Trip Management" component={TripManagementScreen} />
  </Tab.Navigator>
);

export default AdminNavigator;
