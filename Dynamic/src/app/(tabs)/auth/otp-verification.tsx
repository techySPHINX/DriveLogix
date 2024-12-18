import React, { useState,useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NavigationProp } from '@react-navigation/native';
import { validateOTP } from "../../../services/otpService";
import {RootParamList}  from "../../../navigation/type";

interface OTPVerificationProps {
  navigation: NavigationProp<any>;
}

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
        // navigation.reset({
        //   index: 0,
        //   routes: [
        //     { name: user.role === "admin" ? "AdminNavigator" as never : "DriverNavigator" as never },
        //   ],
        // });
      }
    } catch (error) {
      Alert.alert(
        "Invalid OTP",
        "The OTP entered is incorrect. Please try again."
      );
    }
  };
  const showSplashScreen = (user: any) => {
    setTimeout(() => {
      // Display splash screen
      navigation.navigate("SplashScreen" as never);

      // After 2 seconds, navigate to the appropriate screen
      navigation.reset({
        index: 0,
        routes: [
          { name: user.role === "admin" ? "AdminNavigator" as never : "DriverNavigator" as never },
        ],
      });
    }, 2000); 
  };
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../../../../assets/2.png")} style={styles.logo} />
      </View>
      <Text style={styles.title}>OTP Verification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="phone-pad"
        value={otp}
        onChangeText={setOTP}
      />
      <Button title="Verify OTP" onPress={handleVerifyOTP} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16 },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
  },
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
