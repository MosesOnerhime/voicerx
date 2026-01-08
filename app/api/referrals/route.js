// ============================================================
// API ROUTE: /api/referrals
// PRD Section 5.10: Referral Module
// ============================================================
// PURPOSE: Create and list referrals to specialists
// WHO CAN ACCESS:
//   - POST: DOCTOR only
//   - GET: All authenticated users
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { notifyReferralReceived } from '@/lib/notifications';

// POST - Create a referral to a specialist
export async function POST(request) {
  try {
    // 1. AUTHENTICATION
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

    // 2. AUTHORIZATION - Only doctors can create referrals
    if (decoded.role !== 'DOCTOR') {
      return Response.json(
        { error: 'Only doctors can create referrals' },
        { status: 403 }
      );
    }

    // 3. PARSE REQUEST BODY
    const body = await request.json();
    const { appointmentId, referredToId, reason, urgency } = body;

    // 4. VALIDATE REQUIRED FIELDS
    if (!appointmentId || !referredToId || !reason || !urgency) {
      return Response.json(
        { error: 'appointmentId, referredToId, reason, and urgency are required' },
        { status: 400 }
      );
    }

    // Validate urgency
    const validUrgencies = ['ROUTINE', 'URGENT', 'EMERGENCY'];
    if (!validUrgencies.includes(urgency)) {
      return Response.json(
        { error: `urgency must be one of: ${validUrgencies.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. VERIFY APPOINTMENT EXISTS AND BELONGS TO THIS DOCTOR
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        hospitalId: decoded.hospitalId,
        assignedDoctorId: decoded.userId,
        status: 'IN_CONSULTATION',
      },
      include: {
        referral: true,
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!appointment) {
      return Response.json(
        { error: 'Appointment not found or not in consultation' },
        { status: 404 }
      );
    }

    // Check if referral already exists
    if (appointment.referral) {
      return Response.json(
        { error: 'Referral already exists for this appointment' },
        { status: 400 }
      );
    }

    // 6. VERIFY SPECIALIST EXISTS AND IS A DOCTOR
    const specialist = await prisma.user.findFirst({
      where: {
        id: referredToId,
        hospitalId: decoded.hospitalId,
        role: 'DOCTOR',
        isActive: true,
      },
    });

    if (!specialist) {
      return Response.json(
        { error: 'Specialist not found or not a doctor' },
        { status: 404 }
      );
    }

    // Cannot refer to self
    if (specialist.id === decoded.userId) {
      return Response.json(
        { error: 'Cannot refer to yourself' },
        { status: 400 }
      );
    }

    // 7. CREATE REFERRAL AND UPDATE APPOINTMENT STATUS
    const result = await prisma.$transaction(async (tx) => {
      const referral = await tx.referral.create({
        data: {
          appointmentId,
          referredBy: decoded.userId,
          referredTo: referredToId,
          reason,
          urgency,
          status: 'PENDING',
        },
        include: {
          referredByUser: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          referredToUser: {
            select: {
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      });

      // Update appointment status
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'PENDING_REFERRAL',
          consultationCompletedAt: new Date(),
        },
      });

      // Mark current doctor as available
      await tx.user.update({
        where: { id: decoded.userId },
        data: {
          isAvailable: true,
          currentAppointmentId: null,
        },
      });

      return referral;
    });

    // Notify the specialist of the new referral
    notifyReferralReceived(decoded.hospitalId, referredToId, {
      ...result,
      appointment: { patient: appointment.patient },
    });

    return Response.json(
      {
        message: 'Referral created successfully',
        referral: result,
        patient: appointment.patient,
        nextStep: `Referral sent to Dr. ${specialist.firstName} ${specialist.lastName}. Awaiting response.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create referral error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List referrals
export async function GET(request) {
  try {
    // 1. AUTHENTICATION
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

    // 2. PARSE QUERY PARAMS
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const myReferrals = searchParams.get('my') === 'true'; // Referrals I created
    const pending = searchParams.get('pending') === 'true'; // Pending referrals to me
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // 3. BUILD WHERE CLAUSE
    const where = {
      appointment: {
        hospitalId: decoded.hospitalId,
      },
    };

    if (status) {
      where.status = status;
    }

    // If doctor, can filter by referrals they created or received
    if (decoded.role === 'DOCTOR') {
      if (myReferrals) {
        where.referredBy = decoded.userId;
      } else if (pending) {
        where.referredTo = decoded.userId;
        where.status = 'PENDING';
      }
    }

    // 4. FETCH REFERRALS
    const [referrals, totalCount] = await Promise.all([
      prisma.referral.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { urgency: 'desc' }, // EMERGENCY first
          { createdAt: 'desc' },
        ],
        include: {
          appointment: {
            include: {
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  patientIdNumber: true,
                  dateOfBirth: true,
                  gender: true,
                },
              },
            },
          },
          referredByUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
          referredToUser: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
            },
          },
        },
      }),
      prisma.referral.count({ where }),
    ]);

    // Add wait time calculation
    const referralsWithWaitTime = referrals.map((referral) => {
      const waitTimeMs = new Date() - new Date(referral.createdAt);
      const waitTimeMinutes = Math.floor(waitTimeMs / 60000);

      return {
        ...referral,
        waitTime: {
          minutes: waitTimeMinutes,
          display:
            waitTimeMinutes < 60
              ? `${waitTimeMinutes} min`
              : `${Math.floor(waitTimeMinutes / 60)}h ${waitTimeMinutes % 60}m`,
        },
      };
    });

    return Response.json({
      referrals: referralsWithWaitTime,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
