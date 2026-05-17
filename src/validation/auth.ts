import { z } from "zod";

export const appRoleSchema = z.enum(["employee", "manager", "admin"]);

export const roleMetadataSchema = z.object({
  role: appRoleSchema.optional(),
  roles: z.array(appRoleSchema).optional(),
});
