// ============================================================
// API ROUTE: /api/prescriptions/stats
// Returns prescription statistics for pharmacy dashboard
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.split(' ')[1] || cookieToken;

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.hospitalId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count prescriptions by status
    const [pending, dispensed, highPriority, dispensedToday] = await Promise.all([
      // Pending prescriptions (SENT_TO_PHARMACY or DISPENSING)
      prisma.prescription.count({
        where: {
          appointment: { hospitalId: decoded.hospitalId },
          status: { in: ['SENT_TO_PHARMACY', 'DISPENSING'] },
        },
      }),
      // All dispensed prescriptions
      prisma.prescription.count({
        where: {
          appointment: { hospitalId: decoded.hospitalId },
          status: 'DISPENSED',
        },
      }),
      // High priority (EMERGENCY or URGENT) pending prescriptions
      prisma.prescription.count({
        where: {
          appointment: {
            hospitalId: decoded.hospitalId,
            priority: { in: ['EMERGENCY', 'URGENT'] },
          },
          status: { in: ['SENT_TO_PHARMACY', 'DISPENSING'] },
        },
      }),
      // Dispensed today
      prisma.prescription.count({
        where: {
          appointment: { hospitalId: decoded.hospitalId },
          status: 'DISPENSED',
          dispensedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    return Response.json({
      pending,
      dispensed,
      highPriority,
      dispensedToday,
    });
  } catch (error) {
    console.error('Prescription stats error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
