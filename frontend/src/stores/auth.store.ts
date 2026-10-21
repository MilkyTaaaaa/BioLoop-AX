import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: { id: string; name: string } | null;
  token: string | null;
  login: (user: AuthState["user"], token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null });
      },
    }),
    { name: "auth" }
  )
);