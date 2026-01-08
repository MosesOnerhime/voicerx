// ============================================================
// API ROUTE: /api/appointments
// PRD Section 5.3.1: Create Appointment
// PRD Section 2: Streamlined Workflow - STEP 2
// ============================================================
// PURPOSE: Create appointment for patient (starts the pipeline)
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// 
// PIPELINE STATUS FLOW:
// CREATED → VITALS_RECORDED → ASSIGNED → IN_QUEUE → IN_CONSULTATION 
// → PENDING_PHARMACY → COMPLETED
//
// This is where the patient journey begins!
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper function to generate unique appointment number
function generateAppointmentNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APT-${year}-${timestamp}${random}`;
}

// POST - Create new appointment
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

    // Only nurses, receptionists, and admins can create appointments
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses, receptionists, or admins can create appointments' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.patientId || !body.chiefComplaint) {
      return Response.json(
        { error: 'Patient ID and chief complaint are required' },
        { status: 400 }
      );
    }

    // Verify patient exists and belongs to hospital
    const patient = await prisma.patient.findFirst({
      where: {
        id: body.patientId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!patient) {
      return Response.json(
        { error: 'Patient not found or does not belong to your hospital' },
        { status: 404 }
      );
    }

    // Generate unique appointment number
    let appointmentNumber = generateAppointmentNumber();
    
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.appointment.findUnique({
        where: { appointmentNumber },
      });
      
      if (!existing) break;
      
      appointmentNumber = generateAppointmentNumber();
      attempts++;
    }

    // Set priority (default to NORMAL if not provided)
    const priority = body.priority || 'NORMAL';
    const validPriorities = ['NORMAL', 'URGENT', 'EMERGENCY'];
    if (!validPriorities.includes(priority)) {
      return Response.json(
        { error: 'Priority must be NORMAL, URGENT, or EMERGENCY' },
        { status: 400 }
      );
    }

    // Create appointment - STATUS = CREATED (first step in pipeline)
    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        hospitalId: decoded.hospitalId,
        patientId: body.patientId,
        createdBy: decoded.userId,
        chiefComplaint: body.chiefComplaint,
        status: 'CREATED',  // Pipeline Step 1
        priority: priority,
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
            phoneNumber: true,
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
      },
    });

    return Response.json(
      {
        message: 'Appointment created successfully',
        appointment,
        nextStep: 'Record vitals for this patient',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List appointments with filters
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
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const today = searchParams.get('today') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      hospitalId: decoded.hospitalId,
    };

    if (patientId) where.patientId = patientId;
    if (doctorId) where.assignedDoctorId = doctorId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Filter for today's appointments
    if (today) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Get appointments - ordered by priority then time
    const [appointments, totalCount] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' }, // EMERGENCY first
          { createdAt: 'asc' }, // Then FIFO
        ],
        include: {
          patient: {
            select: {
              patientIdNumber: true,
              firstName: true,
              lastName: true,
              gender: true,
              dateOfBirth: true,
              phoneNumber: true,
            },
          },
          assignedDoctor: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          vitalsRecord: {
            select: {
              id: true,
              bloodPressureSystolic: true,
              bloodPressureDiastolic: true,
              temperature: true,
              pulseRate: true,
              recordedAt: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return Response.json({
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}