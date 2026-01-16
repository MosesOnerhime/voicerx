// ============================================================
// API ROUTE: /api/appointments/assign-doctor
// PRD Section 5.5.1: Assign to Doctor
// PRD Workflow - STEP 4: DOCTOR ASSIGNMENT
// ============================================================
// PURPOSE: Assign appointment to available doctor
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// 
// WHAT IT DOES:
// 1. Shows list of available doctors with queue count
// 2. Assigns appointment to selected doctor
// 3. Updates appointment status: VITALS_RECORDED → IN_QUEUE
// 4. Sets doctorAssignedAt timestamp
//
// POST: Assign appointment to doctor
// GET: List available doctors with queue counts
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { notifyNewAppointment } from '@/lib/notifications';

// POST - Assign appointment to doctor
export async function POST(request) {
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

    // Only nurses, receptionists, and admins can assign doctors
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses, receptionists, or admins can assign doctors' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.appointmentId || !body.doctorId) {
      return Response.json(
        { error: 'Both appointmentId and doctorId are required' },
        { status: 400 }
      );
    }

    // Verify appointment exists and belongs to hospital
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: body.appointmentId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Check that vitals have been recorded before assigning to doctor
    if (appointment.status !== 'VITALS_RECORDED') {
      return Response.json(
        { error: 'Vitals must be recorded before assigning to doctor' },
        { status: 400 }
      );
    }

    // Verify doctor exists, belongs to hospital, and is a doctor
    const doctor = await prisma.user.findFirst({
      where: {
        id: body.doctorId,
        hospitalId: decoded.hospitalId,
        role: 'DOCTOR',
        isActive: true,
      },
    });

    if (!doctor) {
      return Response.json(
        { error: 'Doctor not found or not from your hospital' },
        { status: 404 }
      );
    }

    // Check if doctor is available for new assignments
    if (!doctor.isAvailable) {
      return Response.json(
        { error: 'This doctor is currently unavailable for new patient assignments' },
        { status: 400 }
      );
    }

    // Assign appointment to doctor
    // Status: VITALS_RECORDED → IN_QUEUE
    const updatedAppointment = await prisma.appointment.update({
      where: { id: body.appointmentId },
      data: {
        assignedDoctorId: body.doctorId,
        status: 'IN_QUEUE',
        doctorAssignedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            patientIdNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            bloodType: true,
            knownAllergies: true,
            chronicConditions: true,
          },
        },
        assignedDoctor: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
            isAvailable: true,
          },
        },
        vitalsRecord: true,
      },
    });

    // Notify the doctor of the new appointment
    notifyNewAppointment(decoded.hospitalId, body.doctorId, updatedAppointment);

    return Response.json({
      message: 'Appointment assigned to doctor successfully',
      appointment: updatedAppointment,
      nextStep: 'Doctor will see patient in queue',
    });
  } catch (error) {
    console.error('Assign doctor error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List available doctors with queue count
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

    // Build filter for doctors
    const where = {
      hospitalId: decoded.hospitalId,
      role: 'DOCTOR',
      isActive: true,
    };

    if (availableOnly) {
      where.isAvailable = true;
    }

    // Get all doctors with their queue count
    const doctors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialization: true,
        isAvailable: true,
        currentAppointmentId: true,
        // Count appointments in queue for this doctor
        appointmentsAssignedDoctor: {
          where: {
            status: {
              in: ['IN_QUEUE', 'ASSIGNED'],
            },
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    // Format response with queue count
    const doctorsWithQueue = doctors.map(doctor => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      fullName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      isAvailable: doctor.isAvailable,
      isBusy: !!doctor.currentAppointmentId,
      queueCount: doctor.appointmentsAssignedDoctor.length,
    }));

    return Response.json({ 
      doctors: doctorsWithQueue,
      totalDoctors: doctorsWithQueue.length,
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}