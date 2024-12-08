import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useAuth } from "../../../context/AuthContext";

import { NavigationProp } from '@react-navigation/native';

interface OTPVerificationProps {
  navigation: NavigationProp<any>;
}

const OTPVerification = ({ navigation }: OTPVerificationProps) => {
  const { login } = useAuth();
  const [otp, setOtp] = useState("");

  const handleVerification = () => {
    if (otp === "1234") {
      login({ id: 1, role: "admin", token: "dummy-token" }); // Example: Assuming user is admin
      navigation.navigate("AdminTabs");
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />
      <Button title="Verify OTP" onPress={handleVerification} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
});

export default OTPVerification;
