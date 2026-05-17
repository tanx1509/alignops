import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/types/auth";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin / HR",
  employee: "Employee",
  manager: "Manager",
};

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge variant={role === "admin" ? "default" : "secondary"}>
      {roleLabel[role]}
    </Badge>
  );
}
