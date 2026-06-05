import { getSessionFromCookie } from "./auth";
import { getStore } from "./store";

export async function getCurrentUser() {
  const session = await getSessionFromCookie();
  if (!session) return null;

  const store = getStore();
  return store.findUserById(session.userId);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

