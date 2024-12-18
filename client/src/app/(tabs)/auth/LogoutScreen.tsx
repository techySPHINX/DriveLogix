import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";

const LogoutScreen = () => {
  const { logout } = useAuth(); // Use the logout function from the context
  const navigation = useNavigation();

  useEffect(() => {
    // Perform the logout by calling the logout function
    logout();

    // Redirect to the login screen after logout
    // navigation.navigate("Login");
  }, [logout, navigation]);

  return null; // You can display a loading spinner or something while logging out
};

export default LogoutScreen;
