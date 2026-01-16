// ============================================================
// API ROUTE: /api/doctors/me/availability
// Get and update current doctor's availability status
// WHO CAN ACCESS: DOCTOR only
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get current doctor's availability status
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
    if (!decoded || !decoded.userId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get the doctor's current status
    const doctor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isAvailable: true,
        currentAppointmentId: true,
      },
    });

    if (!doctor) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (doctor.role !== 'DOCTOR') {
      return Response.json({ error: 'Only doctors can access this endpoint' }, { status: 403 });
    }

    // Count current active patients
    const currentPatients = await prisma.appointment.count({
      where: {
        assignedDoctorId: doctor.id,
        status: {
          in: ['ASSIGNED', 'IN_QUEUE', 'IN_CONSULTATION'],
        },
      },
    });

    return Response.json({
      isAvailable: doctor.isAvailable,
      currentPatients,
      currentAppointmentId: doctor.currentAppointmentId,
      message: doctor.isAvailable
        ? 'You are available for new patient assignments'
        : 'You are unavailable for new patient assignments',
    });
  } catch (error) {
    console.error('Get availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update doctor's availability status
export async function PUT(request) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.split(' ')[1] || cookieToken;

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { isAvailable } = body;

    if (typeof isAvailable !== 'boolean') {
      return Response.json({ error: 'isAvailable must be a boolean' }, { status: 400 });
    }

    // Get the doctor's current status
    const doctor = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isAvailable: true,
        currentAppointmentId: true,
      },
    });

    if (!doctor) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (doctor.role !== 'DOCTOR') {
      return Response.json({ error: 'Only doctors can update their availability' }, { status: 403 });
    }

    // Update the availability
    const updatedDoctor = await prisma.user.update({
      where: { id: decoded.userId },
      data: { isAvailable },
      select: {
        isAvailable: true,
        currentAppointmentId: true,
      },
    });

    // Count current active patients
    const currentPatients = await prisma.appointment.count({
      where: {
        assignedDoctorId: doctor.id,
        status: {
          in: ['ASSIGNED', 'IN_QUEUE', 'IN_CONSULTATION'],
        },
      },
    });

    return Response.json({
      isAvailable: updatedDoctor.isAvailable,
      currentPatients,
      currentAppointmentId: updatedDoctor.currentAppointmentId,
      message: updatedDoctor.isAvailable
        ? 'You are now available for new patient assignments'
        : 'You are now unavailable for new patient assignments',
    });
  } catch (error) {
    console.error('Update availability error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
