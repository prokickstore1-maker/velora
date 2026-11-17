import { cookies } from "next/headers";
import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "myvelora_admin_session";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "myvelora-default-admin-secret-key-32chars";
const DEFAULT_ADMIN_PASSWORD = "admin123";

/**
 * Generate a signed session token
 */
export function createSessionToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

/**
 * Verify a session token
 */
export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

  if (signature !== expectedSignature) {
    return false;
  }

  // Check expiration (24 hours)
  const [, timestampStr] = payload.split(":");
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}

/**
 * Check if the current request has an authenticated admin session
 * Next.js 16 requirement: await cookies()
 */
export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Verify admin password against env or default
 */
export function checkAdminPassword(password: string): boolean {
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (envHash) {
    const inputHash = crypto.createHash("sha256").update(password).digest("hex");
    return inputHash === envHash;
  }
  return password === DEFAULT_ADMIN_PASSWORD;
}

/**
 * Set admin session cookie
 * Next.js 16 requirement: await cookies()
 */
export async function setAdminSessionCookie(username: string = "admin"): Promise<void> {
  const cookieStore = await cookies();
  const token = createSessionToken(username);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

/**
 * Clear admin session cookie
 * Next.js 16 requirement: await cookies()
 */
export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
