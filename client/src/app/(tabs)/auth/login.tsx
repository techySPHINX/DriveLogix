import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { RootParamList } from "../../../navigation/type"; // Import type for the navigation params
import { requestOTP } from "../../../services/otpService"; // Import the OTP service

// Define the navigation prop type for OTPVerification screen
type NavigationProps = StackNavigationProp<RootParamList, "OTPVerification">;

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const handleSendOTP = async () => {
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await requestOTP(phoneNumber);
      console.log(result);
      Alert.alert("Success", `OTP sent to ${phoneNumber}.`);
      navigation.navigate("OTPVerification", { phoneNumber });
    } catch (error) {
      console.error("OTP request failed:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        maxLength={10}
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        <LinearGradient
          colors={["#4c669f", "#3b5998", "#192f6a"]}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    padding: 20,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 40,
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Avenir Next" : "Roboto",
  },
  input: {
    width: "90%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  button: {
    width: "90%",
    borderRadius: 30,
    overflow: "hidden",
  },
  gradientButton: {
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Login;
