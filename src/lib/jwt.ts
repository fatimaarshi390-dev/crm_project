// lib/auth/jwt.ts  (or wherever this file is)
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in .env');
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'sales' | 'marketing';
  employeeId: string;
  name: string;
  impersonatingBy?: string;
}

// ✅ Fixed createToken
export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

// ✅ Improved verifyToken
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed');
    return null;
  }
}