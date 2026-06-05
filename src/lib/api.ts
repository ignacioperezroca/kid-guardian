import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionFromCookie } from "./auth";
import { getUserById } from "./store";

export async function readJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(
    data,
    typeof init === "number" ? { status: init } : init
  );
}

export async function getApiCurrentUser() {
  const session = await getSessionFromCookie();
  if (!session) return null;
  return getUserById(session.userId);
}

