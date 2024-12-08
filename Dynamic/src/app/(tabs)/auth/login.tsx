import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootParamList } from "../../../navigation/type"; // Import type for the navigation params
import { requestOTP } from "../../../services/otpService"; // Import the OTP service

// Define the navigation prop type for OTPVerification screen
type NavigationProps = StackNavigationProp<RootParamList, "OTPVerification">;

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigation = useNavigation<NavigationProps>(); // Use navigation hook

  // Handle the OTP sending logic
  const handleSendOTP = () => {
    // Validate the phone number
    if (phoneNumber.length !== 10 || isNaN(Number(phoneNumber))) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    try {
      // Simulate OTP request (requestOTP is a placeholder function)
      const result = requestOTP(phoneNumber);
      console.log(result); // Debugging
      Alert.alert("Success", `OTP sent to ${phoneNumber}.`);

      // Navigate to the OTPVerification screen with phoneNumber as a parameter
      navigation.navigate("OTPVerification", { phoneNumber }); // Correct navigation
    } catch (error) {
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        maxLength={10} // Ensure only 10 digits are allowed
      />
      <Button title="Send OTP" onPress={handleSendOTP} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default Login;
