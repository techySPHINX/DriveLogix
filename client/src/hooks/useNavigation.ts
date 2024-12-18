import { useRole } from "./useRole";

export const useNavigation = () => {
  const role = useRole();

  if (role === "admin") {
    return "AdminDashboard";
  } else if (role === "driver") {
    return "DriverTrips";
  }

  return "Login";
};
