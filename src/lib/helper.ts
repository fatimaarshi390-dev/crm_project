import { cookies } from 'next/headers';
import { signToken, verifyToken } from './jwt';   // Apna JWT file
import User from '../../model/User';
// ==================== SET AUTH COOKIE ====================


// ==================== SET AUTH COOKIE (Fixed for Route Handlers) ====================
export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
};

// ==================== REMOVE AUTH COOKIE ====================
// export const removeAuthCookie = () => {
//   cookies().delete('token');
// };

// ==================== GET CURRENT USER (Existing) ====================
export async function getUserFromCookies() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    const data = verifyToken(token);
    if (!data?.userId) return null;

    const user = await User.findById(data.userId)
      .select('-password')
      .lean();

    return user;

  } catch (error) {
    console.error('❌ Error in getUserFromCookies:', error);
    return null;
  }
}