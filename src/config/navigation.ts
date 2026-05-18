import {
  BarChart3,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Gauge,
  GitBranch,
  History,
  Inbox,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { AppRole } from "@/types/auth";

export type NavItem = {
  title: string;
  href: string;
  icon: typeof Gauge;
};

export const roleNavigation: Record<AppRole, NavItem[]> = {
  employee: [
    { title: "My Goals", href: "/employee", icon: FileCheck2 },
    { title: "Check-ins", href: "/employee/check-ins", icon: ClipboardCheck },
  ],
  manager: [
    { title: "Team Queue", href: "/manager", icon: Inbox },
    { title: "Team Check-ins", href: "/manager/check-ins", icon: Users },
    { title: "Team Insights", href: "/manager/insights", icon: BarChart3 },
  ],
  admin: [
    { title: "Control Tower", href: "/admin", icon: Gauge },
    { title: "Org Setup", href: "/admin/org", icon: GitBranch },
    { title: "Governance", href: "/admin/governance", icon: ShieldCheck },
    { title: "Reports", href: "/admin/reports", icon: FileSpreadsheet },
    { title: "Audit Logs", href: "/admin/audit", icon: History },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ],
};
