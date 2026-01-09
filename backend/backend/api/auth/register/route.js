// ============================================================
// API ROUTE: /api/auth/hospital/register
// PRD Section 5.1.1: Hospital Registration
// ============================================================
// PURPOSE: Register a new hospital with an admin user
// WHO CAN ACCESS: Anyone (public endpoint for registration)
// 
// WHAT IT DOES:
// 1. Validates hospital and admin information
// 2. Creates hospital account in database
// 3. Creates admin user account for the hospital
// 4. Returns hospital and admin details
// ============================================================

// ============================================================
// API ROUTE: /api/auth/hospital/register
// ============================================================
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Handle CORS preflight (OPTIONS request)
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200, // Some browsers prefer 200 over 204
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}

export async function POST(request) {
  // Add CORS headers to every response
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    
    console.log('Received registration request:', body); // Debug log

    const { hospital, admin } = body;

    // Validate required fields
    if (!hospital?.name || !hospital?.email || !hospital?.phone || 
        !admin?.firstname || !admin?.lastname || !admin?.email || !admin?.password) {
      return Response.json(
        { error: 'All required fields must be provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate password length
    if (admin.password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if hospital email already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: hospital.email },
          ...(hospital.registrationNo ? [{ registrationNumber: hospital.registrationNo }] : []),
        ],
      },
    });

    if (existingHospital) {
      return Response.json(
        { error: 'Hospital with this email or registration number already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Admin email already exists' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Hash password
    const hashedPassword = await hash(admin.password, 12);

    // Create hospital and admin in transaction
    const result = await prisma.$transaction(async (tx) => {
      const hospitalRecord = await tx.hospital.create({
        data: {
          name: hospital.name,
          email: hospital.email,
          phone: hospital.phone,
          address: hospital.address,
          registrationNumber: hospital.registrationNo,
          isActive: true,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          hospitalId: hospitalRecord.id,
          firstName: admin.firstname,
          lastName: admin.lastname,
          email: admin.email,
          phone: hospital.phone,
          role: 'ADMIN',
          passwordHash: hashedPassword,
          isActive: true,
          isAvailable: true,
        },
      });

      return { hospital: hospitalRecord, adminUser };
    });

    console.log('Registration successful:', result.hospital.id); // Debug log

    return Response.json(
      {
        message: 'Hospital registered successfully',
        hospital: {
          id: result.hospital.id,
          name: result.hospital.name,
          email: result.hospital.email,
        },
        admin: {
          id: result.adminUser.id,
          name: `${result.adminUser.firstName} ${result.adminUser.lastName}`,
          email: result.adminUser.email,
        },
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Hospital registration error:', error);
    return Response.json(
      { 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}