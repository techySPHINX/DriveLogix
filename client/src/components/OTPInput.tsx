import React from "react";
import { TextInput } from "react-native-paper";

interface OTPInputProps {
  value: string;
  onChange: (text: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ value, onChange }) => {
  return (
    <TextInput
      mode="outlined"
      label="Enter OTP"
      value={value}
      onChangeText={onChange}
      keyboardType="number-pad"
      maxLength={4}
    />
  );
};

export default OTPInput;
