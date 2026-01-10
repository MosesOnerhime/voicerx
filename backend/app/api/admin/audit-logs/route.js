// ============================================================
// API ROUTE: /api/admin/audit-logs
// PURPOSE: Get activity logs for the hospital
// WHO CAN ACCESS: ADMIN only
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // Only admins can view audit logs
    if (decoded.role !== 'ADMIN') {
      return Response.json(
        { error: 'Only administrators can view audit logs' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build activity logs from various sources
    const logs = [];

    // Get recent user logins
    const recentLogins = await prisma.user.findMany({
      where: {
        hospitalId: decoded.hospitalId,
        lastLogin: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        lastLogin: true,
      },
      orderBy: { lastLogin: 'desc' },
      take: 20,
    });

    recentLogins.forEach((user) => {
      logs.push({
        id: `login-${user.id}`,
        timestamp: user.lastLogin,
        user: `${user.firstName} ${user.lastName}`,
        action: 'Login',
        resource: 'Authentication',
        status: 'Success',
        ipAddress: '—',
      });
    });

    // Get recent patient registrations
    const recentPatients = await prisma.patient.findMany({
      where: {
        hospitalId: decoded.hospitalId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        registeredAt: true,
        registeredByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
      take: 20,
    });

    recentPatients.forEach((patient) => {
      const registeredBy = patient.registeredByUser
        ? `${patient.registeredByUser.firstName} ${patient.registeredByUser.lastName}`
        : 'System';
      logs.push({
        id: `patient-${patient.id}`,
        timestamp: patient.registeredAt,
        user: registeredBy,
        action: 'Register Patient',
        resource: `Patient: ${patient.firstName} ${patient.lastName}`,
        status: 'Success',
        ipAddress: '—',
      });
    });

    // Get recent appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: {
        hospitalId: decoded.hospitalId,
      },
      select: {
        id: true,
        appointmentNumber: true,
        status: true,
        createdAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        createdByUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    recentAppointments.forEach((apt) => {
      const createdBy = apt.createdByUser
        ? `${apt.createdByUser.firstName} ${apt.createdByUser.lastName}`
        : 'System';
      logs.push({
        id: `apt-${apt.id}`,
        timestamp: apt.createdAt,
        user: createdBy,
        action: 'Create Appointment',
        resource: `Appointment: ${apt.appointmentNumber}`,
        status: 'Success',
        ipAddress: '—',
      });
    });

    // Get recent prescriptions
    const recentPrescriptions = await prisma.prescription.findMany({
      where: {
        hospitalId: decoded.hospitalId,
      },
      select: {
        id: true,
        prescriptionNumber: true,
        createdAt: true,
        prescribedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    recentPrescriptions.forEach((rx) => {
      const prescribedBy = rx.prescribedBy
        ? `${rx.prescribedBy.firstName} ${rx.prescribedBy.lastName}`
        : 'System';
      logs.push({
        id: `rx-${rx.id}`,
        timestamp: rx.createdAt,
        user: prescribedBy,
        action: 'Create Prescription',
        resource: `Prescription: ${rx.prescriptionNumber}`,
        status: 'Success',
        ipAddress: '—',
      });
    });

    // Sort all logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Apply search filter
    let filteredLogs = logs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = logs.filter(
        (log) =>
          log.user.toLowerCase().includes(searchLower) ||
          log.action.toLowerCase().includes(searchLower) ||
          log.resource.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filteredLogs = filteredLogs.filter(
        (log) => log.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Limit results
    filteredLogs = filteredLogs.slice(0, limit);

    // Format timestamps
    const formattedLogs = filteredLogs.map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    }));

    return Response.json({
      logs: formattedLogs,
      total: formattedLogs.length,
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
