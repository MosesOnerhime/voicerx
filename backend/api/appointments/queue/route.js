// ============================================================
// API ROUTE: /api/appointments/queue
// PRD Section 5.6.1: Appointment Queue
// PRD Workflow - STEP 5: WAITING QUEUE
// ============================================================
// PURPOSE: Show doctor their appointment queue
// WHO CAN ACCESS: DOCTOR only
// 
// WHAT IT DOES:
// 1. Gets all appointments assigned to logged-in doctor
// 2. Shows appointments with status IN_QUEUE or ASSIGNED
// 3. Sorts by priority (EMERGENCY → URGENT → NORMAL)
// 4. Then sorts by FIFO (first in, first out) within same priority
// 5. Shows wait time for each patient
// 6. Displays patient info, vitals, allergies, medical history
//
// QUEUE DISPLAY:
// - EMERGENCY patients shown first
// - URGENT patients shown second
// - NORMAL patients shown last
// - Within each priority, oldest appointment first (FIFO)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Doctor's appointment queue
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

    // Only doctors can view their queue
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can view their queue' },
        { status: 403 }
      );
    }

    // Get doctor's queue
    // Priority order: EMERGENCY > URGENT > NORMAL, then FIFO
    const queue = await prisma.appointment.findMany({
      where: {
        assignedDoctorId: decoded.userId,
        status: {
          in: ['IN_QUEUE', 'ASSIGNED'],
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            patientIdNumber: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            bloodType: true,
            genotype: true,
            phoneNumber: true,
            knownAllergies: true,
            chronicConditions: true,
            currentMedications: true,
          },
        },
        vitalsRecord: {
          select: {
            bloodPressureSystolic: true,
            bloodPressureDiastolic: true,
            pulseRate: true,
            temperature: true,
            respiratoryRate: true,
            oxygenSaturation: true,
            weight: true,
            height: true,
            painLevel: true,
            painLocation: true,
            symptomsDescription: true,
            symptomDuration: true,
            recordedAt: true,
            recordedVia: true,
          },
        },
        voiceTranscript: {
          select: {
            id: true,
            rawTranscript: true,
            extractedVitals: true,
            transcriptionStatus: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // EMERGENCY first, then URGENT, then NORMAL
        { doctorAssignedAt: 'asc' }, // Then FIFO (oldest first)
      ],
    });

    // Calculate wait time for each appointment
    const queueWithWaitTime = queue.map(appointment => {
      const waitMinutes = appointment.doctorAssignedAt
        ? Math.floor((Date.now() - appointment.doctorAssignedAt.getTime()) / (1000 * 60))
        : 0;

      // Calculate patient age
      const age = Math.floor(
        (Date.now() - new Date(appointment.patient.dateOfBirth).getTime()) / 
        (1000 * 60 * 60 * 24 * 365.25)
      );

      return {
        ...appointment,
        waitTimeMinutes: waitMinutes,
        patient: {
          ...appointment.patient,
          age: age,
        },
      };
    });

    return Response.json({
      queue: queueWithWaitTime,
      totalCount: queueWithWaitTime.length,
      emergencyCount: queueWithWaitTime.filter(a => a.priority === 'EMERGENCY').length,
      urgentCount: queueWithWaitTime.filter(a => a.priority === 'URGENT').length,
      normalCount: queueWithWaitTime.filter(a => a.priority === 'NORMAL').length,
    });
  } catch (error) {
    console.error('Get queue error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}