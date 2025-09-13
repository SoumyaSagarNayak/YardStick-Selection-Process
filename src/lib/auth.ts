import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'member';
  tenant_id: string;
  tenant_slug: string;
}

export interface JWTPayload extends User {
  iat: number;
  exp: number;
}

export function generateToken(user: User): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        password_hash,
        role,
        tenant_id,
        tenants!inner(slug)
      `)
      .eq('email', email)
      .single();

    if (error || !userData) {
      return null;
    }

    const isValidPassword = await comparePassword(password, userData.password_hash);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      tenant_id: userData.tenant_id,
      tenant_slug: userData.tenants.slug
    };
  } catch {
    return null;
  }
}