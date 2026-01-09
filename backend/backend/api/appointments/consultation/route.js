// ============================================================
// API ROUTE: /api/appointments/consultation
// PRD Section 5.6.2: Consultation View
// PRD Section 5.6.3: Auto Status Update
// PRD Workflow - STEP 6: DOCTOR CONSULTATION
// ============================================================
// PURPOSE: Manage doctor consultation (start, save notes, complete)
// WHO CAN ACCESS: DOCTOR only
// 
// ACTIONS:
// 1. START CONSULTATION:
//    - Status: IN_QUEUE → IN_CONSULTATION
//    - Doctor isAvailable: true → false (busy)
//    - Set currentAppointmentId
//    - Set consultationStartedAt timestamp
//
// 2. SAVE CONSULTATION NOTES:
//    - Save history, physical exam, assessment, plan
//    - Save diagnosis codes (ICD-10)
//    - Can be updated multiple times during consultation
//
// 3. COMPLETE CONSULTATION:
//    - Status: IN_CONSULTATION → COMPLETED (if no prescription)
//    - Doctor isAvailable: false → true (available)
//    - Clear currentAppointmentId
//    - Set consultationCompletedAt timestamp
//    - System notifies nurse that doctor is free
//
// POST: Start or complete consultation
// PUT: Save/update consultation notes
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { notifyDoctorAvailable, notifyDoctorBusy } from '@/lib/notifications';

// POST - Start or complete consultation
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

    // Only doctors can manage consultations
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can manage consultations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, action } = body;

    if (!appointmentId) {
      return Response.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    if (!action || !['start', 'complete'].includes(action)) {
      return Response.json(
        { error: 'action must be either "start" or "complete"' },
        { status: 400 }
      );
    }

    // Verify appointment exists and is assigned to this doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        assignedDoctorId: decoded.userId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or not assigned to you' },
        { status: 404 }
      );
    }

    // ===== START CONSULTATION =====
    if (action === 'start') {
      // Check if appointment is in queue
      if (appointment.status !== 'IN_QUEUE' && appointment.status !== 'ASSIGNED') {
        return Response.json(
          { error: 'Appointment must be in queue to start consultation' },
          { status: 400 }
        );
      }

      // Start consultation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update appointment status: IN_QUEUE → IN_CONSULTATION
        const updatedAppointment = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            status: 'IN_CONSULTATION',
            consultationStartedAt: new Date(),
          },
          include: {
            patient: true,
            vitalsRecord: true,
          },
        });

        // Update doctor: set as busy (not available)
        await tx.user.update({
          where: { id: decoded.userId },
          data: {
            isAvailable: false,
            currentAppointmentId: appointmentId,
          },
        });

        return updatedAppointment;
      });

      // Notify nurses that doctor is now busy
      notifyDoctorBusy(decoded.hospitalId, {
        id: decoded.userId,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      });

      return Response.json({
        message: 'Consultation started',
        appointment: result,
        doctorStatus: 'BUSY',
        nextStep: 'Document consultation and create prescription if needed',
      });
    }

    // ===== COMPLETE CONSULTATION =====
    if (action === 'complete') {
      // Check if consultation is in progress
      if (appointment.status !== 'IN_CONSULTATION') {
        return Response.json(
          { error: 'Consultation must be in progress to complete it' },
          { status: 400 }
        );
      }

      // Complete consultation in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Check if prescription exists
        const prescription = await tx.prescription.findUnique({
          where: { appointmentId },
        });

        // Update appointment status
        const updatedAppointment = await tx.appointment.update({
          where: { id: appointmentId },
          data: {
            status: prescription ? 'PENDING_PHARMACY' : 'COMPLETED',
            consultationCompletedAt: new Date(),
            completedAt: prescription ? null : new Date(),
          },
        });

        // Update doctor: set as available (free)
        await tx.user.update({
          where: { id: decoded.userId },
          data: {
            isAvailable: true,
            currentAppointmentId: null,
          },
        });

        return { updatedAppointment, prescription };
      });

      // Notify nurses that doctor is now available
      notifyDoctorAvailable(decoded.hospitalId, {
        id: decoded.userId,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      });

      return Response.json({
        message: 'Consultation completed',
        appointment: result.updatedAppointment,
        doctorStatus: 'AVAILABLE',
        hasPrescription: !!result.prescription,
        nextStep: result.prescription
          ? 'Prescription sent to pharmacy'
          : 'Appointment completed',
      });
    }
  } catch (error) {
    console.error('Consultation action error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Save/update consultation notes
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

    // Only doctors can create consultation notes
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can create consultation notes' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, ...noteData } = body;

    if (!appointmentId) {
      return Response.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    // Verify appointment exists and is assigned to this doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        assignedDoctorId: decoded.userId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Must be in consultation to save notes
    if (appointment.status !== 'IN_CONSULTATION') {
      return Response.json(
        { error: 'Consultation must be started before creating notes' },
        { status: 400 }
      );
    }

    // Check if notes already exist
    const existingNotes = await prisma.consultationNote.findUnique({
      where: { appointmentId },
    });

    let consultationNote;

    if (existingNotes) {
      // Update existing notes
      consultationNote = await prisma.consultationNote.update({
        where: { appointmentId },
        data: {
          historyOfPresentIllness: noteData.historyOfPresentIllness,
          physicalExamination: noteData.physicalExamination,
          assessment: noteData.assessment,
          plan: noteData.plan,
          diagnosisCodes: noteData.diagnosisCodes,
          additionalNotes: noteData.additionalNotes,
        },
      });
    } else {
      // Create new notes
      consultationNote = await prisma.consultationNote.create({
        data: {
          appointmentId,
          historyOfPresentIllness: noteData.historyOfPresentIllness,
          physicalExamination: noteData.physicalExamination,
          assessment: noteData.assessment,
          plan: noteData.plan,
          diagnosisCodes: noteData.diagnosisCodes,
          additionalNotes: noteData.additionalNotes,
          createdBy: decoded.userId,
        },
      });
    }

    return Response.json({
      message: 'Consultation notes saved successfully',
      consultationNote,
    });
  } catch (error) {
    console.error('Save consultation notes error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}