import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TabsLayout from "./(tabs)/_layout";
import NotFoundScreen from "./+not-found"; 
import { NavigationIndependentTree } from "@react-navigation/core";
import AuthProvider from "../context/AuthContext";
import AppNavigator from "../navigation/AppNavigator";

const Stack = createNativeStackNavigator();

const AppLayout = () => {
  return (
    <AuthProvider>
        <AppNavigator />
    </AuthProvider>
  );
};

export default AppLayout;
