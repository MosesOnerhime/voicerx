// ============================================================
// API ROUTE: /api/admin/staff
// GET list of staff members, DELETE to disable staff
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - List all staff members
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

    if (decoded.role !== 'ADMIN') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build filter
    const where = {
      hospitalId: decoded.hospitalId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get staff with pagination
    const [staff, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          specialization: true,
          isActive: true,
          isAvailable: true,
          createdAt: true,
          lastLogin: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform to frontend format
    const formattedStaff = staff.map(s => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      role: s.role.charAt(0) + s.role.slice(1).toLowerCase(), // DOCTOR -> Doctor
      specialization: s.specialization || '',
      status: s.isActive ? 'Active' : 'Inactive',
      isAvailable: s.isAvailable,
      createdAt: s.createdAt,
      lastLogin: s.lastLogin,
    }));

    return Response.json({
      staff: formattedStaff,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get staff error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Disable a staff member
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Cannot disable yourself
    if (userId === decoded.userId) {
      return Response.json({ error: 'Cannot disable your own account' }, { status: 400 });
    }

    // Verify user belongs to same hospital
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Disable user (soft delete)
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return Response.json({ message: 'Staff member disabled successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
