// ============================================================
// API ROUTE: /api/doctors/available
// Get list of ALL doctors with availability status
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - List all doctors with availability status
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    // Build filter
    const where = {
      hospitalId: decoded.hospitalId,
      role: 'DOCTOR',
      isActive: true,
    };

    // If availableOnly is true, filter by availability
    if (availableOnly) {
      where.isAvailable = true;
    }

    // Get ALL active doctors (not just available ones)
    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        specialization: true,
        isAvailable: true,
        currentAppointmentId: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Get current patient count for each doctor
    const doctorsWithStats = await Promise.all(
      doctors.map(async (doc) => {
        // Count appointments in active states
        const currentPatients = await prisma.appointment.count({
          where: {
            assignedDoctorId: doc.id,
            status: {
              in: ['ASSIGNED', 'IN_QUEUE', 'IN_CONSULTATION'],
            },
          },
        });

        // Count only patients in queue (not currently being seen)
        const queueCount = await prisma.appointment.count({
          where: {
            assignedDoctorId: doc.id,
            status: {
              in: ['ASSIGNED', 'IN_QUEUE'],
            },
          },
        });

        return {
          id: doc.id,
          firstName: doc.firstName,
          lastName: doc.lastName,
          name: `Dr. ${doc.firstName} ${doc.lastName}`,
          specialty: doc.specialization || 'General Physician',
          email: doc.email,
          isAvailable: doc.isAvailable,
          isBusy: !!doc.currentAppointmentId, // True if currently with a patient
          currentPatients, // Total active appointments
          queueCount, // Patients waiting in queue
        };
      })
    );

    // Sort: Available doctors first, then by queue count
    const sorted = doctorsWithStats.sort((a, b) => {
      // Available doctors first
      if (a.isAvailable !== b.isAvailable) {
        return b.isAvailable ? 1 : -1;
      }
      // Then sort by queue size (smallest first)
      return a.currentPatients - b.currentPatients;
    });

    return Response.json({
      doctors: sorted,
      count: sorted.length,
      availableCount: sorted.filter(d => d.isAvailable).length,
      busyCount: sorted.filter(d => !d.isAvailable).length,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}