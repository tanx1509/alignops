import { Badge } from "@/components/ui/badge";
import type { AppRole } from "@/types/auth";

const roleLabel: Record<AppRole, string> = {
  admin: "Admin / HR",
  employee: "Employee",
  manager: "Manager",
};

export function RoleBadge({ role }: { role: AppRole }) {
  return (
    <Badge
      className="border bg-background/80 px-2.5 py-1 text-[11px] font-semibold uppercase"
      variant={role === "admin" ? "default" : "secondary"}
    >
      {roleLabel[role]}
    </Badge>
  );
}
