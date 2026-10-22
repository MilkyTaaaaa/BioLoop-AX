export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
};

// Payload untuk membuat user baru (tanpa field yang dibuat server)
export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
};