import React from "react";
import { View, Text, Button } from "react-native";
import { NavigationProp } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<any>;
}

const DriverHomeScreen = ({ navigation }: Props) => {
  return (
    <View>
      <Text>Driver Home Screen</Text>
      <Button
        title="Go to Settings"
        onPress={() => navigation.navigate("DriverSettings")}
      />
    </View>
  );
};

export default DriverHomeScreen;
