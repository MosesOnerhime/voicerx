// ============================================================
// API ROUTE: /api/prescriptions/[id]/dispense
// PRD Section 5.9.1 & 5.9.2: Prescription Queue & Dispense Medication
// PRD Workflow - STEP 8: PHARMACY DISPENSING (Final Step!)
// ============================================================
// PURPOSE: Pharmacist dispenses medication to complete patient journey
// WHO CAN ACCESS: PHARMACIST only
// 
// WHAT IT DOES:
// 1. Pharmacist views prescription details
// 2. Verifies patient identity and medication
// 3. Marks prescription as dispensed
// 4. All items marked as dispensed
// 5. Updates appointment status: PENDING_PHARMACY → COMPLETED
// 6. Sets dispensedAt timestamp
// 7. PATIENT JOURNEY COMPLETE! 🎉
//
// GET: Get prescription details (with patient info, allergies, medications)
// POST: Dispense medication (complete the journey!)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get prescription details
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

    const prescriptionId = params.id;

    // Get prescription with full details
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        appointment: {
          hospitalId: decoded.hospitalId,
        },
      },
      include: {
        items: true,
        patient: {
          select: {
            id: true,
            patientIdNumber: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            bloodType: true,
            phoneNumber: true,
            knownAllergies: true,
            chronicConditions: true,
            currentMedications: true,
          },
        },
        prescribedByUser: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true,
          },
        },
        dispensedByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        appointment: {
          select: {
            appointmentNumber: true,
            chiefComplaint: true,
            consultationNote: {
              select: {
                assessment: true,
                diagnosisCodes: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      return Response.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Calculate patient age
    const age = Math.floor(
      (Date.now() - new Date(prescription.patient.dateOfBirth).getTime()) / 
      (1000 * 60 * 60 * 24 * 365.25)
    );

    return Response.json({ 
      prescription: {
        ...prescription,
        patient: {
          ...prescription.patient,
          age: age,
        },
      },
    });
  } catch (error) {
    console.error('Get prescription error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Dispense prescription (Complete patient journey!)
export async function POST(request, { params }) {
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

    // Only pharmacists can dispense prescriptions
    if (decoded.role !== 'PHARMACIST') {
      return Response.json(
        { error: 'Only pharmacists can dispense prescriptions' },
        { status: 403 }
      );
    }

    const prescriptionId = params.id;
    const body = await request.json();

    // Verify prescription exists and belongs to hospital
    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        appointment: {
          hospitalId: decoded.hospitalId,
        },
      },
      include: {
        appointment: true,
      },
    });

    if (!prescription) {
      return Response.json(
        { error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check if already dispensed
    if (prescription.status === 'DISPENSED') {
      return Response.json(
        { error: 'Prescription already dispensed' },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (prescription.status === 'CANCELLED') {
      return Response.json(
        { error: 'Prescription has been cancelled' },
        { status: 400 }
      );
    }

    // Dispense prescription and complete appointment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update prescription status: → DISPENSED
      const updatedPrescription = await tx.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: 'DISPENSED',
          dispensedAt: new Date(),
          dispensedBy: decoded.userId,
          pharmacistNotes: body.pharmacistNotes || null,
        },
        include: {
          items: true,
          patient: {
            select: {
              patientIdNumber: true,
              firstName: true,
              lastName: true,
            },
          },
          prescribedByUser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          dispensedByUser: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      // Mark all prescription items as dispensed
      await tx.prescriptionItem.updateMany({
        where: { prescriptionId },
        data: { isDispensed: true },
      });

      // Update appointment to COMPLETED: PENDING_PHARMACY → COMPLETED
      await tx.appointment.update({
        where: { id: prescription.appointmentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return updatedPrescription;
    });

    return Response.json({
      message: '🎉 Prescription dispensed successfully! Patient journey complete!',
      prescription: result,
      appointmentStatus: 'COMPLETED',
      patientJourneyComplete: true,
    });
  } catch (error) {
    console.error('Dispense prescription error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}