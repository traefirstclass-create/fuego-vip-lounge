import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

// Verifies a Firebase ID token from the Authorization header and confirms
// the caller has an admins/{uid} document — the same authorization check
// admin.html already relies on via Firestore security rules.
export async function requireAdmin(authorizationHeader: string | null): Promise<string> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new AdminAuthError("Missing admin credentials.", 401);
  }
  const idToken = authorizationHeader.slice("Bearer ".length);

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    throw new AdminAuthError("Invalid or expired admin session.", 401);
  }

  const adminDoc = await getAdminDb().collection("admins").doc(uid).get();
  if (!adminDoc.exists) {
    throw new AdminAuthError("This account is not authorized for admin actions.", 403);
  }

  return uid;
}
