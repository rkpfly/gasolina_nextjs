import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// Name of the HttpOnly cookie that holds the admin session JWT.
export const SESSION_COOKIE = 'admin_session';

// How long a session lasts before the cookie must be re-issued.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

/** Sign a new admin session token. */
export async function createSession(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

/** Verify a session token. Returns the payload if valid, otherwise null. */
export async function verifySession(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}
