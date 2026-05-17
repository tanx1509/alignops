import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

export const dateWindowSchema = z
  .object({
    opensAt: z.coerce.date(),
    closesAt: z.coerce.date(),
  })
  .refine((value) => value.closesAt > value.opensAt, {
    message: "Window close date must be after open date.",
    path: ["closesAt"],
  });
