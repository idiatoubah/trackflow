import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'trackflow-super-secret-jwt-key-2026';
const COOKIE_NAME = 'trackflow_session';

export interface UserSession {
  userId: string;
  storeId: string;
  email: string;
  role: string;
  name?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
}

export async function createSession(sessionPayload: UserSession) {
  const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '7d' });
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
