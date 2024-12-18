// src/@types/navigation.d.ts (or any other type declaration file)

import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    export interface RootParamList {
      Login: undefined;
      OTPVerification: { phoneNumber: string };
    }
  }
}

export type RootParamList = {
  Login: undefined;
  OTPVerification: { phoneNumber: string };
};
