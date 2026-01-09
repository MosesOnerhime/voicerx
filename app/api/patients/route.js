// ============================================================
// API ROUTE: /api/patients
// PRD Section 5.2.1: Patient Registration
// PRD Section 5.2.2: Patient Search
// ============================================================
// PURPOSE: Register new patients and search existing ones
// WHO CAN ACCESS: NURSE, RECEPTIONIST, ADMIN
// 
// POST: Create new patient
// GET: Search/list patients
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helper function to generate unique patient ID
function generatePatientId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `P${timestamp}${random}`;
}

// POST - Register new patient
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

    // Only nurses, receptionists, and admins can register patients
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses, receptionists, or admins can register patients' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.dateOfBirth || 
        !body.gender || !body.phoneNumber || !body.emergencyContactName ||
        !body.emergencyContactPhone || !body.emergencyContactRelationship) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if patient already exists with same phone
    const existingPatient = await prisma.patient.findFirst({
      where: {
        hospitalId: decoded.hospitalId,
        phoneNumber: body.phoneNumber,
      },
    });

    if (existingPatient) {
      return Response.json(
        { 
          error: 'Patient with this phone number already exists',
          existingPatient: {
            id: existingPatient.id,
            patientIdNumber: existingPatient.patientIdNumber,
            firstName: existingPatient.firstName,
            lastName: existingPatient.lastName,
          },
        },
        { status: 400 }
      );
    }

    // Generate unique patient ID
    let patientIdNumber = generatePatientId();
    
    // Ensure uniqueness (try up to 10 times)
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.patient.findUnique({
        where: { patientIdNumber },
      });
      
      if (!existing) break;
      
      patientIdNumber = generatePatientId();
      attempts++;
    }

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        hospitalId: decoded.hospitalId,
        patientIdNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        bloodType: body.bloodType || null,
        genotype: body.genotype || null,
        phoneNumber: body.phoneNumber,
        email: body.email || null,
        address: body.address || null,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelationship: body.emergencyContactRelationship,
        knownAllergies: body.knownAllergies || null,
        chronicConditions: body.chronicConditions || null,
        currentMedications: body.currentMedications || null,
        status: 'ACTIVE',
        registeredBy: decoded.userId,
      },
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
        registeredAt: true,
      },
    });

    return Response.json(
      {
        message: 'Patient registered successfully',
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Patient registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Search/list patients
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
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    // Build search filter
    const where = {
      hospitalId: decoded.hospitalId,
    };

    if (status) {
      where.status = status;
    }

    // Search by name, patient ID, phone, or email
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { patientIdNumber: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get patients with pagination
    const [patients, totalCount] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { registeredAt: 'desc' },
        select: {
          id: true,
          patientIdNumber: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          bloodType: true,
          phoneNumber: true,
          email: true,
          status: true,
          registeredAt: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return Response.json({
      patients,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}