// ============================================================
// API ROUTE: /api/vitals
// PRD Section 5.4: Vitals Collection Module
// PRD Section 5.4.1: Voice-Enabled Vitals Capture
// PRD Workflow - STEP 3: VITALS COLLECTION
// ============================================================
// PURPOSE: Record patient vitals (manual or voice)
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// 
// RECORDING METHODS:
// - MANUAL: Nurse types in vitals
// - VOICE: Nurse records conversation (AI transcribes) - COMING SOON
// - HYBRID: Combination of both
//
// UPDATES APPOINTMENT STATUS: CREATED → VITALS_RECORDED
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Record vitals for an appointment
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

    // Only nurses, receptionists, and admins can record vitals
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses or receptionists can record vitals' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate appointment ID
    if (!body.appointmentId) {
      return Response.json(
        { error: 'Appointment ID is required' },
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
        { error: 'Appointment not found or does not belong to your hospital' },
        { status: 404 }
      );
    }

    // Check if vitals already recorded
    const existingVitals = await prisma.vitalsRecord.findUnique({
      where: { appointmentId: body.appointmentId },
    });

    if (existingVitals) {
      return Response.json(
        { error: 'Vitals already recorded for this appointment. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Set recording method
    const recordedVia = body.recordedVia || 'MANUAL';
    const validMethods = ['MANUAL', 'VOICE', 'HYBRID'];
    if (!validMethods.includes(recordedVia)) {
      return Response.json(
        { error: 'recordedVia must be MANUAL, VOICE, or HYBRID' },
        { status: 400 }
      );
    }

    // Create vitals record and update appointment status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create vitals record
      const vitalsRecord = await tx.vitalsRecord.create({
        data: {
          appointmentId: body.appointmentId,
          bloodPressureSystolic: body.bloodPressureSystolic || null,
          bloodPressureDiastolic: body.bloodPressureDiastolic || null,
          pulseRate: body.pulseRate || null,
          temperature: body.temperature || null,
          respiratoryRate: body.respiratoryRate || null,
          oxygenSaturation: body.oxygenSaturation || null,
          weight: body.weight || null,
          height: body.height || null,
          painLevel: body.painLevel || null,
          painLocation: body.painLocation || null,
          symptomsDescription: body.symptomsDescription || null,
          symptomDuration: body.symptomDuration || null,
          recordedVia: recordedVia,
          recordedBy: decoded.userId,
        },
      });

      // Update appointment status: CREATED → VITALS_RECORDED
      const updatedAppointment = await tx.appointment.update({
        where: { id: body.appointmentId },
        data: {
          status: 'VITALS_RECORDED',
        },
      });

      return { vitalsRecord, updatedAppointment };
    });

    return Response.json(
      {
        message: 'Vitals recorded successfully',
        vitalsRecord: result.vitalsRecord,
        appointmentStatus: result.updatedAppointment.status,
        nextStep: 'Assign appointment to an available doctor',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Record vitals error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get vitals for an appointment
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

    // Get appointment ID from query
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return Response.json(
        { error: 'appointmentId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify appointment belongs to hospital
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Get vitals record
    const vitalsRecord = await prisma.vitalsRecord.findUnique({
      where: { appointmentId },
      include: {
        recordedByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        appointment: {
          select: {
            appointmentNumber: true,
            patient: {
              select: {
                patientIdNumber: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!vitalsRecord) {
      return Response.json(
        { error: 'Vitals not recorded for this appointment' },
        { status: 404 }
      );
    }

    return Response.json({ vitalsRecord });
  } catch (error) {
    console.error('Get vitals error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update vitals
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
    if (!decoded || !decoded.hospitalId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only nurses and receptionists can update vitals
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses or receptionists can update vitals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, ...vitalData } = body;

    if (!appointmentId) {
      return Response.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    // Verify appointment and vitals exist
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        vitalsRecord: true,
      },
    });

    if (!appointment || !appointment.vitalsRecord) {
      return Response.json(
        { error: 'Appointment or vitals record not found' },
        { status: 404 }
      );
    }

    // Update vitals
    const updatedVitals = await prisma.vitalsRecord.update({
      where: { appointmentId },
      data: vitalData,
    });

    return Response.json({
      message: 'Vitals updated successfully',
      vitalsRecord: updatedVitals,
    });
  } catch (error) {
    console.error('Update vitals error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}