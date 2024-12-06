// src/app/(tabs)/admin/adminNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AdminDashboard from "./dashboard";
import AdminAnalytics from "./analytics";
import AdminSettings from "./settings";
import TripManagementScreen from "./TripManagementScreen";
import ManageDrivers from "./manage-drivers";


const Tab = createBottomTabNavigator();

const AdminNavigator = () => (
  <Tab.Navigator>
   <Tab.Screen name="Dashboard" component={AdminDashboard} />
   <Tab.Screen name="Analytics" component={AdminAnalytics} />
   <Tab.Screen name="Settings" component={AdminSettings} />
   <Tab.Screen name="Trip Management" component={TripManagementScreen} />
   <Tab.Screen name="Manage Drivers" component={ManageDrivers} />
  </Tab.Navigator>
);

export default AdminNavigator;
