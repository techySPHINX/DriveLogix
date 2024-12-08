import { useAuth } from "../context/AuthContext";

export const useRole = () => {
  const { user } = useAuth(); // `user` should already have a proper type in `useAuth`
  if (!user) {
    throw new Error("User is not authenticated");
  }
  // Ensure TypeScript knows `user` has a `role` property
  return user?.role ?? null;
};
