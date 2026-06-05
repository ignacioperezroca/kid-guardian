import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  AUTH_SECRET: z.string().optional(),
  APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  APP_URL: process.env.APP_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export const env = parsedEnv.success ? parsedEnv.data : {};

export const APP_URL = env.APP_URL ?? "http://localhost:3000";
export const AUTH_SECRET = env.AUTH_SECRET ?? "dev-kidguardian-secret-change-me";
export const DATABASE_URL = env.DATABASE_URL ?? null;
export const NODE_ENV = env.NODE_ENV ?? "development";

