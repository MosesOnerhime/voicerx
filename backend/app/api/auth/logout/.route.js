// ============================================================
// API ROUTE: /api/auth/logout
// PURPOSE: Log out user and mark doctors as unavailable
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    // Get token from header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.split(' ')[1] || cookieToken;

    // If we have a token, mark doctor as unavailable
    if (token) {
      try {
        const decoded = await verifyToken(token);
        
        // If user is a doctor, mark as unavailable on logout
        if (decoded && decoded.role === 'DOCTOR') {
          await prisma.user.update({
            where: { id: decoded.userId },
            data: {
              isAvailable: false,        // ← Mark as unavailable
              currentAppointmentId: null, // ← Clear current appointment
            },
          });
        }
      } catch (error) {
        // Token might be invalid, but we still want to clear the cookie
        console.log('Token validation failed during logout, clearing cookie anyway');
      }
    }

    // Clear the auth cookie
    const response = Response.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    response.headers.set(
      'Set-Cookie',
      'auth-token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}