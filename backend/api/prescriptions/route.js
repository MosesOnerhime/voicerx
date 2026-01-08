// ============================================================
// API ROUTE: /api/prescriptions
// PRD Section 5.8.1: Create Prescription
// PRD Workflow - STEP 7: PRESCRIPTION TO PHARMACY
// ============================================================
// PURPOSE: Doctor creates prescription that goes to pharmacy
// WHO CAN ACCESS: DOCTOR (create), PHARMACIST (view queue)
// 
// WHAT IT DOES:
// 1. Doctor creates prescription with medication items
// 2. Auto-generates prescription number (RX-2025-XXXXXX)
// 3. Automatically sends to pharmacy (status = SENT_TO_PHARMACY)
// 4. Updates appointment status: IN_CONSULTATION → PENDING_PHARMACY
// 5. Prescription appears in pharmacy queue
//
// PRESCRIPTION ITEMS:
// - Medication name
// - Dosage (e.g., "500mg")
// - Frequency (e.g., "3 times daily")
// - Duration (e.g., "7 days")
// - Quantity (number of pills/doses)
// - Instructions (e.g., "Take after meals")
//
// POST: Create new prescription
// GET: List prescriptions (or pharmacy queue)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { notifyPrescriptionReady } from '@/lib/notifications';

// Helper function to generate unique prescription number
function generatePrescriptionNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RX-${year}-${timestamp}${random}`;
}

// POST - Create prescription
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

    // Only doctors can create prescriptions
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can create prescriptions' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.appointmentId) {
      return Response.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return Response.json(
        { error: 'At least one medication item is required' },
        { status: 400 }
      );
    }

    // Validate each medication item
    for (let i = 0; i < body.items.length; i++) {
      const item = body.items[i];
      if (!item.medicationName || !item.dosage || !item.frequency || 
          !item.duration || !item.quantity) {
        return Response.json(
          { error: `Item ${i + 1}: medicationName, dosage, frequency, duration, and quantity are required` },
          { status: 400 }
        );
      }
    }

    // Verify appointment exists and is assigned to this doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: body.appointmentId,
        assignedDoctorId: decoded.userId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        patient: true,
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or not assigned to you' },
        { status: 404 }
      );
    }

    // Prescription can only be created during consultation
    if (appointment.status !== 'IN_CONSULTATION') {
      return Response.json(
        { error: 'Prescription can only be created during consultation' },
        { status: 400 }
      );
    }

    // Check if prescription already exists for this appointment
    const existingPrescription = await prisma.prescription.findUnique({
      where: { appointmentId: body.appointmentId },
    });

    if (existingPrescription) {
      return Response.json(
        { error: 'Prescription already exists for this appointment' },
        { status: 400 }
      );
    }

    // Generate unique prescription number
    let prescriptionNumber = generatePrescriptionNumber();
    
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.prescription.findUnique({
        where: { prescriptionNumber },
      });
      
      if (!existing) break;
      
      prescriptionNumber = generatePrescriptionNumber();
      attempts++;
    }

    // Create prescription with items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create prescription
      const prescription = await tx.prescription.create({
        data: {
          prescriptionNumber,
          appointmentId: body.appointmentId,
          patientId: appointment.patientId,
          prescribedBy: decoded.userId,
          status: 'SENT_TO_PHARMACY', // Automatically send to pharmacy
          sentToPharmacyAt: new Date(),
          items: {
            create: body.items.map(item => ({
              medicationName: item.medicationName,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              quantity: item.quantity,
              instructions: item.instructions || null,
            })),
          },
        },
        include: {
          items: true,
          patient: {
            select: {
              patientIdNumber: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              knownAllergies: true,
            },
          },
          prescribedByUser: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      });

      // Update appointment status: IN_CONSULTATION → PENDING_PHARMACY
      await tx.appointment.update({
        where: { id: body.appointmentId },
        data: {
          status: 'PENDING_PHARMACY',
        },
      });

      return prescription;
    });

    // Notify pharmacists of new prescription
    notifyPrescriptionReady(decoded.hospitalId, result);

    return Response.json(
      {
        message: 'Prescription created and sent to pharmacy',
        prescription: result,
        nextStep: 'Complete consultation or add more prescriptions',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create prescription error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List prescriptions (or pharmacy queue)
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
    const patientId = searchParams.get('patientId');
    const appointmentId = searchParams.get('appointmentId');
    const status = searchParams.get('status');
    const queue = searchParams.get('queue') === 'true'; // For pharmacy queue
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      appointment: {
        hospitalId: decoded.hospitalId,
      },
    };

    if (patientId) {
      where.patientId = patientId;
    }

    if (appointmentId) {
      where.appointmentId = appointmentId;
    }

    if (status) {
      where.status = status;
    }

    // Pharmacy queue: only SENT_TO_PHARMACY and DISPENSING
    if (queue) {
      where.status = {
        in: ['SENT_TO_PHARMACY', 'DISPENSING'],
      };
    }

    // Get prescriptions with pagination
    const [prescriptions, totalCount] = await Promise.all([
      prisma.prescription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { prescribedAt: 'desc' },
        include: {
          items: true,
          patient: {
            select: {
              patientIdNumber: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              knownAllergies: true,
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
            },
          },
        },
      }),
      prisma.prescription.count({ where }),
    ]);

    return Response.json({
      prescriptions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Get prescriptions error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}