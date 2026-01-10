// ============================================================
// API ROUTE: /api/admin/hospital-profile
// GET/PUT hospital profile for admin dashboard
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Fetch hospital profile
export async function GET(request) {
  try {
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

    // Only admin can access
    if (decoded.role !== 'ADMIN') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get hospital with admin user info
    const hospital = await prisma.hospital.findUnique({
      where: { id: decoded.hospitalId },
      include: {
        users: {
          where: { role: 'ADMIN' },
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
          take: 1,
        },
      },
    });

    if (!hospital) {
      return Response.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const admin = hospital.users[0];

    return Response.json({
      hospitalName: hospital.name,
      businessEmail: hospital.email,
      phoneNumber: hospital.phone,
      address: hospital.address || '',
      registrationNumber: hospital.registrationNumber || '',
      adminName: admin ? `${admin.firstName} ${admin.lastName}` : '',
      adminEmail: admin?.email || '',
    });
  } catch (error) {
    console.error('Get hospital profile error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update hospital profile
export async function PUT(request) {
  try {
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

    if (decoded.role !== 'ADMIN') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();

    // Update hospital
    const hospital = await prisma.hospital.update({
      where: { id: decoded.hospitalId },
      data: {
        name: body.hospitalName,
        email: body.businessEmail,
        phone: body.phoneNumber,
        address: body.address,
      },
    });

    return Response.json({
      message: 'Hospital profile updated successfully',
      hospital,
    });
  } catch (error) {
    console.error('Update hospital profile error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
