// ============================================================
// API ROUTE: /api/referrals/[id]/respond
// PRD Section 5.10: Referral Module
// ============================================================
// PURPOSE: Accept or decline a referral
// WHO CAN ACCESS: DOCTOR (specialist who received the referral)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Generate unique appointment number
function generateAppointmentNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APT-${year}-${timestamp}${random}`;
}

// POST - Accept or decline a referral
export async function POST(request, { params }) {
  try {
    const { id: referralId } = await params;

    // 1. AUTHENTICATION
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

    // 2. AUTHORIZATION - Only doctors can respond to referrals
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can respond to referrals' },
        { status: 403 }
      );
    }

    // 3. PARSE REQUEST BODY
    const body = await request.json();
    const { action, declineReason } = body;

    // Validate action
    if (!action || !['accept', 'decline'].includes(action)) {
      return Response.json(
        { error: 'action must be "accept" or "decline"' },
        { status: 400 }
      );
    }

    // 4. FIND REFERRAL
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        referredTo: decoded.userId,
        status: 'PENDING',
        appointment: {
          hospitalId: decoded.hospitalId,
        },
      },
      include: {
        appointment: {
          include: {
            patient: true,
            vitalsRecord: true,
            consultationNote: true,
          },
        },
        referredByUser: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
      },
    });

    if (!referral) {
      return Response.json(
        { error: 'Referral not found or not pending' },
        { status: 404 }
      );
    }

    if (action === 'decline') {
      // 5a. DECLINE REFERRAL
      const updatedReferral = await prisma.$transaction(async (tx) => {
        const declined = await tx.referral.update({
          where: { id: referralId },
          data: {
            status: 'DECLINED',
            respondedAt: new Date(),
          },
        });

        // Update original appointment back to consultation
        await tx.appointment.update({
          where: { id: referral.appointmentId },
          data: {
            status: 'IN_CONSULTATION',
          },
        });

        return declined;
      });

      return Response.json({
        message: 'Referral declined',
        referral: updatedReferral,
        nextStep: 'Original doctor will be notified to continue treatment.',
      });
    }

    // 5b. ACCEPT REFERRAL - Create new appointment for specialist
    const result = await prisma.$transaction(async (tx) => {
      // Generate unique appointment number
      let appointmentNumber = generateAppointmentNumber();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await tx.appointment.findUnique({
          where: { appointmentNumber },
        });
        if (!existing) break;
        appointmentNumber = generateAppointmentNumber();
        attempts++;
      }

      // Create new appointment for the specialist
      const newAppointment = await tx.appointment.create({
        data: {
          appointmentNumber,
          hospitalId: decoded.hospitalId,
          patientId: referral.appointment.patientId,
          createdBy: decoded.userId,
          assignedDoctorId: decoded.userId,
          chiefComplaint: `REFERRAL: ${referral.reason}`,
          status: 'IN_QUEUE',
          priority: referral.urgency === 'EMERGENCY' ? 'EMERGENCY' : referral.urgency === 'URGENT' ? 'URGENT' : 'NORMAL',
          doctorAssignedAt: new Date(),
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              patientIdNumber: true,
            },
          },
        },
      });

      // Update referral with new appointment ID
      const updatedReferral = await tx.referral.update({
        where: { id: referralId },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
          newAppointmentId: newAppointment.id,
        },
      });

      // Mark original appointment as completed
      await tx.appointment.update({
        where: { id: referral.appointmentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return {
        referral: updatedReferral,
        newAppointment,
      };
    });

    return Response.json({
      message: 'Referral accepted',
      referral: result.referral,
      newAppointment: result.newAppointment,
      originalAppointment: {
        id: referral.appointment.id,
        chiefComplaint: referral.appointment.chiefComplaint,
        vitalsRecord: referral.appointment.vitalsRecord,
        consultationNote: referral.appointment.consultationNote,
      },
      referredBy: referral.referredByUser,
      nextStep: 'New appointment created. Patient added to your queue.',
    });
  } catch (error) {
    console.error('Respond to referral error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get referral details
export async function GET(request, { params }) {
  try {
    const { id: referralId } = await params;

    // 1. AUTHENTICATION
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

    // 2. FIND REFERRAL WITH FULL DETAILS
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        appointment: {
          hospitalId: decoded.hospitalId,
        },
      },
      include: {
        appointment: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                patientIdNumber: true,
                dateOfBirth: true,
                gender: true,
                bloodType: true,
                knownAllergies: true,
                chronicConditions: true,
                currentMedications: true,
              },
            },
            vitalsRecord: true,
            consultationNote: true,
            voiceTranscript: true,
          },
        },
        referredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
        referredToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialization: true,
            email: true,
          },
        },
      },
    });

    if (!referral) {
      return Response.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Calculate patient age
    const dob = new Date(referral.appointment.patient.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return Response.json({
      referral: {
        ...referral,
        appointment: {
          ...referral.appointment,
          patient: {
            ...referral.appointment.patient,
            age,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get referral error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
