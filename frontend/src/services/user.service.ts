import { api } from "@/lib/api";
import type { User } from "@/types/user";

export const userService = {
  getAll: () => api.get<User[]>("/users").then((r) => r.data),
  getById: (id: string) => api.get<User>(`/users/${id}`).then((r) => r.data),
  create: (payload: Partial<User>) => api.post<User>("/users", payload).then((r) => r.data),
};