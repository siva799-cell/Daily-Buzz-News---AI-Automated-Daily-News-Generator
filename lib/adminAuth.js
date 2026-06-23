import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import AdminUser from '@/models/AdminUser';
import dbConnect from './dbConnect';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey12345!';

/**
 * Hash a password
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/**
 * Verify administrator credentials and generate token
 */
export async function authenticateAdmin(username, password) {
  await dbConnect();
  
  // First, verify against env configuration for ease of deployment
  const envAdminUser = process.env.ADMIN_USERNAME || 'admin';
  const envAdminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === envAdminUser && password === envAdminPass) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return { success: true, token };
  }

  // Fallback to database user check
  const dbUser = await AdminUser.findOne({ username });
  if (dbUser) {
    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (isMatch) {
      const token = jwt.sign({ id: dbUser._id, username: dbUser.username, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
      return { success: true, token };
    }
  }

  return { success: false, error: 'Invalid username or password.' };
}

/**
 * Verify JWT token from request cookies/headers
 */
export function verifyAdminToken(request) {
  try {
    const tokenCookie = request.cookies.get('admin_token');
    const token = tokenCookie ? tokenCookie.value : null;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
}
