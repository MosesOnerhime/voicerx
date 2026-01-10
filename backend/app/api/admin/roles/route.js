// ============================================================
// API ROUTE: /api/admin/roles
// PURPOSE: Get system roles with user counts
// WHO CAN ACCESS: ADMIN only
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Role definitions with permissions
const ROLE_DEFINITIONS = {
  ADMIN: {
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissions: ['All Permissions'],
  },
  DOCTOR: {
    name: 'Doctor',
    description: 'Access to patient records and medical functions',
    permissions: ['View Patients', 'Edit Medical Records', 'Prescribe Medications', 'View Prescriptions'],
  },
  NURSE: {
    name: 'Nurse',
    description: 'Access to patient care and monitoring',
    permissions: ['View Patients', 'Record Vitals', 'Register Patients', 'Create Appointments'],
  },
  PHARMACIST: {
    name: 'Pharmacist',
    description: 'Manage medications and prescriptions',
    permissions: ['View Prescriptions', 'Dispense Medications', 'View Inventory'],
  },
  RECEPTIONIST: {
    name: 'Receptionist',
    description: 'Front desk operations and patient check-in',
    permissions: ['View Patients', 'Register Patients', 'Create Appointments', 'Check-in Patients'],
  },
};

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

    // Only admins can view roles
    if (decoded.role !== 'ADMIN') {
      return Response.json(
        { error: 'Only administrators can view roles' },
        { status: 403 }
      );
    }

    // Get user counts by role for this hospital
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      where: {
        hospitalId: decoded.hospitalId,
        isActive: true,
      },
      _count: true,
    });

    // Build count map
    const countMap = {};
    roleCounts.forEach((rc) => {
      countMap[rc.role] = rc._count;
    });

    // Build roles response
    const roles = Object.entries(ROLE_DEFINITIONS).map(([roleKey, roleData], index) => ({
      id: String(index + 1),
      roleKey,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      userCount: countMap[roleKey] || 0,
    }));

    return Response.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
