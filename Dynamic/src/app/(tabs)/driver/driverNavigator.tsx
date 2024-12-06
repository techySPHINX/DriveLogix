// src/app/(tabs)/driver/driverNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import StatusScreen from "./StatusScreen";
import TripScreen from "./Tripscreen";
import DriverHomeScreen from "./DriverHomeScreen";

const Tab = createBottomTabNavigator();

const DriverNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name="StatusScreen" component={StatusScreen} />
    <Tab.Screen name="TripScreen" component={TripScreen} />
    <Tab.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
  </Tab.Navigator>
);

export default DriverNavigator;
