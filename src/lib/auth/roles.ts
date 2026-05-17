import type { User } from "@supabase/supabase-js";

import type { AppRole } from "@/types/auth";

const roleRank: Record<AppRole, number> = {
  employee: 1,
  manager: 2,
  admin: 3,
};

export const roleHome: Record<AppRole, string> = {
  employee: "/employee",
  manager: "/manager",
  admin: "/admin",
};

function isAppRole(role: AppRole | null): role is AppRole {
  return role !== null;
}

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized === "employee" || normalized === "manager" || normalized === "admin") {
    return normalized;
  }

  return null;
}

export function getUserRoles(
  user: User | null,
  options: { fallbackToEmployee?: boolean } = {},
): AppRole[] {
  const { fallbackToEmployee = true } = options;

  if (!user) {
    return [];
  }

  const metadata = {
    ...user.user_metadata,
    ...user.app_metadata,
  };

  const roles = Array.isArray(metadata.roles)
    ? metadata.roles.map(normalizeRole).filter(isAppRole)
    : [normalizeRole(metadata.role)].filter(isAppRole);

  if (roles.length > 0) {
    return Array.from(new Set(roles));
  }

  return fallbackToEmployee ? ["employee"] : [];
}

export function hasRole(user: User | null, requiredRole: AppRole): boolean {
  const roles = getUserRoles(user);

  return hasRoleFromRoles(roles, requiredRole);
}

export function hasRoleFromRoles(roles: AppRole[], requiredRole: AppRole): boolean {
  return roles.some((role) => roleRank[role] >= roleRank[requiredRole]);
}

export function getHighestRole(user: User | null): AppRole {
  return getHighestRoleFromRoles(getUserRoles(user));
}

export function getHighestRoleFromRoles(roles: AppRole[]): AppRole {
  return [...roles].sort((a, b) => roleRank[b] - roleRank[a])[0] ?? "employee";
}

export function getDefaultRoleHome(user: User | null): string {
  return roleHome[getHighestRole(user)];
}

export function requiredRoleForPath(pathname: string): AppRole | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return "admin";
  }

  if (pathname === "/manager" || pathname.startsWith("/manager/")) {
    return "manager";
  }

  if (pathname === "/employee" || pathname.startsWith("/employee/")) {
    return "employee";
  }

  return null;
}
