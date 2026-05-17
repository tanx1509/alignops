import { redirect } from "next/navigation";

import { hasRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: AppRole) {
  const user = await requireUser();

  if (!hasRole(user, role)) {
    redirect("/unauthorized");
  }

  return user;
}
