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

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();

    // Extract data from request
    const {
      hospitalName,
      email,
      phone,
      address,
      registrationNumber,
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPhone,
      adminPassword,
    } = body;

    // Validate required fields
    if (!hospitalName || !email || !phone || !adminFirstName || 
        !adminLastName || !adminEmail || !adminPhone || !adminPassword) {
      return Response.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Validate password length
    if (adminPassword.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if hospital email already exists
    const orConditions = [{ email: email }];
    if (registrationNumber) {
      orConditions.push({ registrationNumber });
    }

    const existingHospital = await prisma.hospital.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (existingHospital) {
      return Response.json(
        { error: 'Hospital with this email or registration number already exists' },
        { status: 400 }
      );
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Admin email already exists' },
        { status: 400 }
      );
    }

    // Hash password for security
    const hashedPassword = await hash(adminPassword, 12);

    // Create hospital and admin user in a transaction (all or nothing)
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create hospital
      const hospital = await tx.hospital.create({
        data: {
          name: hospitalName,
          email: email,
          phone: phone,
          address: address,
          registrationNumber: registrationNumber,
          isActive: true,
        },
      });

      // Step 2: Create admin user for the hospital
      const adminUser = await tx.user.create({
        data: {
          hospitalId: hospital.id,
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail,
          phone: adminPhone,
          role: 'ADMIN',
          passwordHash: hashedPassword,
          isActive: true,
          isAvailable: true,
        },
      });

      return { hospital, adminUser };
    });

    // Return success response
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Hospital registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}