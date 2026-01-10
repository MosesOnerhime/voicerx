// ============================================================
// API ROUTE: /api/admin/setup-status
// GET setup completion status for admin dashboard
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
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

    if (decoded.role !== 'ADMIN') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check hospital profile completeness
    const hospital = await prisma.hospital.findUnique({
      where: { id: decoded.hospitalId },
    });

    const hospitalProfile = !!(
      hospital?.name &&
      hospital?.email &&
      hospital?.phone &&
      hospital?.address
    );

    // Check if staff has been uploaded (more than just admin)
    const staffCount = await prisma.user.count({
      where: {
        hospitalId: decoded.hospitalId,
        role: { not: 'ADMIN' },
      },
    });

    const staffUploaded = staffCount > 0;

    // Get some stats
    const [totalStaff, totalPatients, todayAppointments] = await Promise.all([
      prisma.user.count({
        where: { hospitalId: decoded.hospitalId, isActive: true },
      }),
      prisma.patient.count({
        where: { hospitalId: decoded.hospitalId },
      }),
      prisma.appointment.count({
        where: {
          hospitalId: decoded.hospitalId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return Response.json({
      hospitalProfile,
      staffUploaded,
      systemStatus: 'operational',
      stats: {
        totalStaff,
        totalPatients,
        todayAppointments,
      },
    });
  } catch (error) {
    console.error('Get setup status error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
