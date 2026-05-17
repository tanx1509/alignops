import { redirect } from "next/navigation";
import {
  AppRole as DbAppRole,
  Prisma,
  RoleAssignmentStatus,
  UserStatus,
} from "@prisma/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { hasRoleFromRoles, getUserRoles, roleHome } from "@/lib/auth/roles";
import { prisma } from "@/lib/db/prisma";
import type { AppRole, AuthUserSummary } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";

const dbRoleRank: Record<DbAppRole, number> = {
  [DbAppRole.EMPLOYEE]: 1,
  [DbAppRole.MANAGER]: 2,
  [DbAppRole.ADMIN]: 3,
};

export type CurrentUser = AuthUserSummary & {
  authProviderId: string;
  dbRoles: DbAppRole[];
  primaryDbRole: DbAppRole;
};

function dbRoleToAppRole(role: DbAppRole): AppRole {
  switch (role) {
    case DbAppRole.ADMIN:
      return "admin";
    case DbAppRole.MANAGER:
      return "manager";
    case DbAppRole.EMPLOYEE:
      return "employee";
  }
}

function appRoleToDbRole(role: AppRole): DbAppRole {
  switch (role) {
    case "admin":
      return DbAppRole.ADMIN;
    case "manager":
      return DbAppRole.MANAGER;
    case "employee":
      return DbAppRole.EMPLOYEE;
  }
}

function getHighestDbRole(roles: DbAppRole[]): DbAppRole {
  const highestRole = [...roles].sort((a, b) => dbRoleRank[b] - dbRoleRank[a])[0];

  return highestRole ?? DbAppRole.EMPLOYEE;
}

function getDisplayName(authUser: SupabaseUser, fullName: string): string {
  const metadata = authUser.user_metadata ?? {};
  const metadataName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  return fullName || metadataName || authUser.email || "Workspace user";
}

async function getSupabaseUser(): Promise<SupabaseUser | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

async function resolveCurrentUser(authUser: SupabaseUser): Promise<CurrentUser | null> {
  const now = new Date();
  const identityFilters: Prisma.UserWhereInput[] = [
    { authProviderId: authUser.id },
  ];

  if (authUser.email) {
    identityFilters.push({ email: authUser.email });
  }

  const appUser = await prisma.user.findFirst({
    where: {
      OR: identityFilters,
      deletedAt: null,
      status: UserStatus.ACTIVE,
    },
    include: {
      roleAssignments: {
        where: {
          deletedAt: null,
          status: RoleAssignmentStatus.ACTIVE,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!appUser) {
    return null;
  }

  const assignedRoles = appUser.roleAssignments.map(({ role }) => role);
  const dbRoles =
    assignedRoles.length > 0
      ? assignedRoles
      : getUserRoles(authUser).map(appRoleToDbRole);
  const roles = Array.from(new Set(dbRoles.map(dbRoleToAppRole)));
  const primaryDbRole = getHighestDbRole(dbRoles);

  return {
    authProviderId: authUser.id,
    dbRoles,
    email: appUser.email,
    id: appUser.id,
    name: getDisplayName(authUser, appUser.fullName),
    primaryDbRole,
    roles,
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const authUser = await getSupabaseUser();

  if (!authUser) {
    return null;
  }

  return resolveCurrentUser(authUser);
}

export async function requireUser(): Promise<CurrentUser> {
  const authUser = await getSupabaseUser();

  if (!authUser) {
    redirect("/login");
  }

  const user = await resolveCurrentUser(authUser);

  if (!user) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requireRole(role: AppRole): Promise<CurrentUser> {
  const user = await requireUser();

  if (!hasRoleFromRoles(user.roles, role)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function redirectToHomeForCurrentUser() {
  const user = await requireUser();
  const highestRole = dbRoleToAppRole(user.primaryDbRole);

  redirect(roleHome[highestRole]);
}
