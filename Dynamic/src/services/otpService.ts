import { verifyOTP } from "./mockAPI";

export const mockUsers = [
  { id: 1, phone: "1234567890", role: "admin", otp: "123456" },
  { id: 2, phone: "0987654321", role: "driver", otp: "654321" },
  // Add 8 more users
  { id: 3, phone: "1111111111", role: "driver", otp: "111111" },
  { id: 4, phone: "2222222222", role: "admin", otp: "222222" },
  { id: 5, phone: "3333333333", role: "driver", otp: "333333" },
  { id: 6, phone: "4444444444", role: "admin", otp: "444444" },
  { id: 7, phone: "5555555555", role: "driver", otp: "555555" },
  { id: 8, phone: "6666666666", role: "admin", otp: "666666" },
  { id: 9, phone: "7777777777", role: "driver", otp: "777777" },
  { id: 10, phone: "8888888888", role: "admin", otp: "888888" },
];
export const requestOTP = (phone: string) => {
  console.log(`OTP sent to ${phone}`); // Mock OTP request
  return "OTP sent successfully";
};

export const validateOTP = async (phone: string, otp: string) => {
  try {
    // Assuming mockUsers is an array of user objects that includes id, role, etc.
    const user = mockUsers.find((u) => u.phone === phone && u.otp === otp);
    if (!user) throw new Error("Invalid OTP");

    return {
      id: user.id,
      role: user.role,
      token: "mock-token", // Assume a mock token here
      phone: user.phone,
    };
  } catch (error) {
    throw new Error("OTP validation failed");
  }
};
