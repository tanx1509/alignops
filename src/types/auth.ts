export type AppRole = "employee" | "manager" | "admin";

export type AuthUserSummary = {
  id: string;
  email: string | null;
  name: string;
  roles: AppRole[];
};
