import { useAuth } from "./useAuth";

export const useRole = () => {
  const { user } = useAuth(); // `user` should already have a proper type in `useAuth`

  // Ensure TypeScript knows `user` has a `role` property
  return user?.role ?? null;
};
