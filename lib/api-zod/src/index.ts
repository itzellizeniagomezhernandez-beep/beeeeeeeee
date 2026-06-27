import { z } from "zod";

export * from "./generated/api";
export * from "./generated/types";

export const HealthCheckResponse = z.object({
  status: z.string(),
});

export const RedeemLicenseBody = z.object({
  key: z.string().min(1),
  deviceInfo: z.string().optional().default(""),
  username: z.string().optional().default(""),
});

export const CheckLicenseStatusBody = z.object({
  key: z.string().min(1),
});

export const AdminLoginBody = z.object({
  password: z.string().min(1),
});

export const AdminGenerateLicenseBody = z.object({
  tier: z.enum(["vip", "free"]).optional().default("vip"),
  duration: z.enum(["1day", "7days", "30days", "permanent"]).default("30days"),
  note: z.string().optional().default(""),
  quantity: z.coerce.number().int().min(1).max(100).optional().default(1),
});

export const AdminRevokeLicenseParams = z.object({
  id: z.coerce.number().int().positive(),
});
