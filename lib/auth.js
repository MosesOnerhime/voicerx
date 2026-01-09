// ============================================================
// AUTHENTICATION UTILITY
// ============================================================
// This verifies JWT tokens to authenticate users

import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Verifies JWT token and extracts user information
 * @param {string} token - JWT token from Authorization header or cookie
 * @returns {Object|null} - User info or null if invalid
 */
export async function verifyToken(token) {
  try {
    const decoded = verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}