import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "./env";

let prisma: PrismaClient | null = null;

export function getPrismaClient() {
  if (!DATABASE_URL) return null;

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

