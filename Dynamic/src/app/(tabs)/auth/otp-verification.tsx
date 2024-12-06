// src/app/(tabs)/auth/otp-verification.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { validateOTP } from "../../../services/otpService";
import { useAuth } from "../../../context/AuthContext";
import {RootParamList}  from "../../../navigation/type";

const OTPVerification = () => {
  const [otp, setOTP] = useState("");
  const route =
    useRoute<RouteProp<RootParamList, "OTPVerification">>();
  const navigation = useNavigation();
  const { login } = useAuth();

  const phoneNumber = route.params?.phoneNumber;

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    try {
      // Validate OTP and get the user object
      const user = await validateOTP(phoneNumber, otp);
      if (user) {
        login(user); // Call login with the user object
        Alert.alert("Success", "OTP Verified!");
        // Redirect based on the user role
        navigation.reset({
          index: 0,
          routes: [
            { name: user.role === "admin" ? "AdminNavigator" as never : "DriverNavigator" as never },
          ],
        });
      }
    } catch (error) {
      Alert.alert(
        "Invalid OTP",
        "The OTP entered is incorrect. Please try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to {phoneNumber}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOTP}
        maxLength={6} // Assuming OTP length is 6
      />
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20 },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default OTPVerification;
