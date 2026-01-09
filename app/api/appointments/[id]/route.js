// ============================================================
// API ROUTE: /api/appointments/[id]
// PURPOSE: Get full appointment details with all related data
// WHO CAN ACCESS: All authenticated users
// ============================================================
// This endpoint provides complete appointment information including:
// - Patient details
// - Vitals record
// - Consultation notes
// - Prescription (if created)
// - Assigned doctor info
// - Voice transcript (if exists)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get complete appointment details
export async function GET(request, { params }) {
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

    const appointmentId = params.id;

    // Get appointment with all related data
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        patient: {
          select: {
            id: true,
            patientIdNumber: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            bloodType: true,
            genotype: true,
            phoneNumber: true,
            email: true,
            address: true,
            emergencyContactName: true,
            emergencyContactPhone: true,
            emergencyContactRelationship: true,
            knownAllergies: true,
            chronicConditions: true,
            currentMedications: true,
          },
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedDoctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            isAvailable: true,
          },
        },
        vitalsRecord: {
          include: {
            recordedByUser: {
              select: {
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        voiceTranscript: true,
        consultationNote: {
          include: {
            createdByUser: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
        prescription: {
          include: {
            items: true,
            dispensedByUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        referral: {
          include: {
            referredByUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            referredToUser: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Calculate patient age
    const age = Math.floor(
      (Date.now() - new Date(appointment.patient.dateOfBirth).getTime()) / 
      (1000 * 60 * 60 * 24 * 365.25)
    );

    // Calculate wait times
    const waitTimes = {
      totalMinutes: appointment.createdAt 
        ? Math.floor((Date.now() - appointment.createdAt.getTime()) / (1000 * 60))
        : 0,
      doctorAssignedWaitMinutes: appointment.doctorAssignedAt
        ? Math.floor((Date.now() - appointment.doctorAssignedAt.getTime()) / (1000 * 60))
        : 0,
      consultationDurationMinutes: appointment.consultationStartedAt && appointment.consultationCompletedAt
        ? Math.floor((appointment.consultationCompletedAt.getTime() - appointment.consultationStartedAt.getTime()) / (1000 * 60))
        : 0,
    };

    return Response.json({
      appointment: {
        ...appointment,
        patient: {
          ...appointment.patient,
          age: age,
        },
        waitTimes,
      },
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment (mainly for status changes)
export async function PUT(request, { params }) {
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

    const appointmentId = params.id;
    const body = await request.json();

    // Verify appointment exists and belongs to hospital
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!existingAppointment) {
      return Response.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Only certain roles can update certain fields
    const updateData = {};

    // Nurses/Receptionists can update priority and chief complaint
    if (['NURSE', 'RECEPTIONIST', 'ADMIN'].includes(decoded.role)) {
      if (body.priority) updateData.priority = body.priority;
      if (body.chiefComplaint) updateData.chiefComplaint = body.chiefComplaint;
    }

    // Admins can cancel appointments
    if (decoded.role === 'ADMIN' && body.status === 'CANCELLED') {
      updateData.status = 'CANCELLED';
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: updateData,
    });

    return Response.json({
      message: 'Appointment updated successfully',
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}