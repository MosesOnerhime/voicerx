// ============================================================
// API ROUTE: /api/users/upload
// PRD Section 5.1.2: Staff Upload
// ============================================================
// PURPOSE: Bulk upload staff (doctors, nurses, pharmacists)
// WHO CAN ACCESS: ADMIN only
// 
// WHAT IT DOES:
// 1. Accepts array of staff data (from CSV or manual input)
// 2. Validates each staff member
// 3. Creates user accounts for all staff
// 4. Assigns temporary password (Welcome@123)
// 5. Returns list of created staff
//
// EXAMPLE REQUEST BODY:
// {
//   "staffData": [
//     {
//       "firstName": "Sarah",
//       "lastName": "Johnson",
//       "email": "sarah@hospital.com",
//       "phone": "+2348012345678",
//       "role": "DOCTOR",
//       "specialization": "General Practice"
//     }
//   ]
// }
// ============================================================

import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// POST - Bulk upload staff
export async function POST(request) {
  try {
    // Get token from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    const token = authHeader?.split(' ')[1] || cookieToken;

    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is authenticated
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.hospitalId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only admins can upload staff
    if (decoded.role !== 'ADMIN') {
      return Response.json(
        { error: 'Only administrators can upload staff' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { staffData } = body;

    // Validate staffData is an array
    if (!Array.isArray(staffData) || staffData.length === 0) {
      return Response.json(
        { error: 'staffData must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each staff member
    const validatedStaff = [];
    const errors = [];

    for (let i = 0; i < staffData.length; i++) {
      const staff = staffData[i];
      const rowNum = i + 1;

      // Check required fields
      if (!staff.firstName) {
        errors.push({ row: rowNum, error: 'First name is required' });
        continue;
      }
      if (!staff.lastName) {
        errors.push({ row: rowNum, error: 'Last name is required' });
        continue;
      }
      if (!staff.email) {
        errors.push({ row: rowNum, error: 'Email is required' });
        continue;
      }
      if (!staff.phone) {
        errors.push({ row: rowNum, error: 'Phone is required' });
        continue;
      }
      if (!staff.role) {
        errors.push({ row: rowNum, error: 'Role is required' });
        continue;
      }

      // Validate role
      const validRoles = ['DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST'];
      if (!validRoles.includes(staff.role)) {
        errors.push({ 
          row: rowNum, 
          error: `Role must be one of: ${validRoles.join(', ')}` 
        });
        continue;
      }

      // Doctors must have specialization
      if (staff.role === 'DOCTOR' && !staff.specialization) {
        errors.push({ row: rowNum, error: 'Specialization is required for doctors' });
        continue;
      }

      validatedStaff.push(staff);
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return Response.json(
        { 
          error: 'Validation failed',
          validationErrors: errors,
        },
        { status: 400 }
      );
    }

    // Check for duplicate emails in the upload
    const emailSet = new Set();
    const duplicateEmails = [];
    
    for (const staff of validatedStaff) {
      if (emailSet.has(staff.email)) {
        duplicateEmails.push(staff.email);
      } else {
        emailSet.add(staff.email);
      }
    }

    if (duplicateEmails.length > 0) {
      return Response.json(
        { 
          error: 'Duplicate emails found in upload',
          duplicates: duplicateEmails,
        },
        { status: 400 }
      );
    }

    // Check if any emails already exist in database
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: validatedStaff.map(s => s.email),
        },
      },
      select: { email: true },
    });

    if (existingUsers.length > 0) {
      return Response.json(
        { 
          error: 'Some emails already exist in the system',
          existingEmails: existingUsers.map(u => u.email),
        },
        { status: 400 }
      );
    }

    // Create all staff users with temporary password
    const tempPassword = 'Welcome@123'; // Users must change on first login
    const hashedPassword = await hash(tempPassword, 12);

    const createdUsers = await prisma.$transaction(
      validatedStaff.map(staff =>
        prisma.user.create({
          data: {
            hospitalId: decoded.hospitalId,
            firstName: staff.firstName,
            lastName: staff.lastName,
            email: staff.email,
            phone: staff.phone,
            role: staff.role,
            specialization: staff.specialization || null,
            licenseNumber: staff.licenseNumber || null,
            passwordHash: hashedPassword,
            isActive: true,
            isAvailable: staff.role === 'DOCTOR' ? true : undefined,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            specialization: true,
          },
        })
      )
    );

    return Response.json(
      {
        message: `Successfully created ${createdUsers.length} staff members`,
        created: createdUsers,
        tempPassword: tempPassword, // In production, send via email instead
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bulk staff upload error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List all staff
export async function GET(request) {
  try {
    // Get token
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
    const role = searchParams.get('role');

    // Build filter
    const where = {
      hospitalId: decoded.hospitalId,
    };

    if (role) {
      where.role = role;
    }

    // Get staff from database
    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        specialization: true,
        licenseNumber: true,
        isAvailable: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ staff });
  } catch (error) {
    console.error('Get staff error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}