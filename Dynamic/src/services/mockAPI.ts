export const mockUsers = [
  { id: 3, phone: "1111111111", role: "driver", otp: "111111" },
  { id: 4, phone: "2222222222", role: "admin", otp: "222222" },
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
