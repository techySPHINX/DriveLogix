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
{ id: 10, phone: "8888888888", role: "admin", otp: "888888" }
];

export const verifyOTP = (phone: string, otp: string) => {
  const user = mockUsers.find((u) => u.phone === phone && u.otp === otp);
  if (!user) throw new Error("Invalid OTP");
  return { id: user.id, phone: user.phone, role: user.role };
};

export const fetchAdminData = () => ({
  drivers: 20,
  trips: 200,
  earnings: "$10,000",
  notifications: ["New driver request", "System update planned"],
});

export const fetchDriverData = () => ({
  trips: [
    { id: 1, destination: "City A", status: "Completed" },
    { id: 2, destination: "City B", status: "In Progress" },
  ],
  earnings: "$5,000",
  notifications: ["Trip update", "Payment received"],
});
