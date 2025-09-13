import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function authenticateRequest(request: NextRequest): JWTPayload | null {
  const token = getAuthToken(request);
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = authenticateRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export function requireAdmin(request: NextRequest): JWTPayload {
  const user = requireAuth(request);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}