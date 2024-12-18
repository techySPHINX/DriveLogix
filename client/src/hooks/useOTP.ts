import { useState } from "react";
import { validateOTP } from "../services/otpService";

export const useOTP = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const result = await validateOTP(phone, otp);
      setLoading(false);
      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  return { verify, loading, error };
};
