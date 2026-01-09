// ============================================================
// API ROUTE: /api/patients/[id]
// PURPOSE: Get, Update, or Delete single patient
// WHO CAN ACCESS: All authenticated users (view), NURSE/ADMIN (update/delete)
// ============================================================

import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET - Get single patient with full details
export async function GET(request, { params }) {
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

    const patientId = params.id;

    // Get patient with full details including appointment history
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        hospitalId: decoded.hospitalId,
      },
      include: {
        registeredByUser: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        appointments: {
          select: {
            id: true,
            appointmentNumber: true,
            chiefComplaint: true,
            status: true,
            priority: true,
            createdAt: true,
            assignedDoctor: {
              select: {
                firstName: true,
                lastName: true,
                specialization: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!patient) {
      return Response.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate age
    const age = Math.floor(
      (Date.now() - new Date(patient.dateOfBirth).getTime()) / 
      (1000 * 60 * 60 * 24 * 365.25)
    );

    return Response.json({
      patient: {
        ...patient,
        age: age,
      },
    });
  } catch (error) {
    console.error('Get patient error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update patient information
export async function PUT(request, { params }) {
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

    // Only nurses, receptionists, and admins can update patients
    const allowedRoles = ['NURSE', 'RECEPTIONIST', 'ADMIN'];
    if (!allowedRoles.includes(decoded.role)) {
      return Response.json(
        { error: 'Only nurses, receptionists, or admins can update patients' },
        { status: 403 }
      );
    }

    const patientId = params.id;
    const body = await request.json();

    // Verify patient exists and belongs to hospital
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!existingPatient) {
      return Response.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Update patient
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        firstName: body.firstName || existingPatient.firstName,
        lastName: body.lastName || existingPatient.lastName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existingPatient.dateOfBirth,
        gender: body.gender || existingPatient.gender,
        bloodType: body.bloodType !== undefined ? body.bloodType : existingPatient.bloodType,
        genotype: body.genotype !== undefined ? body.genotype : existingPatient.genotype,
        phoneNumber: body.phoneNumber || existingPatient.phoneNumber,
        email: body.email !== undefined ? body.email : existingPatient.email,
        address: body.address !== undefined ? body.address : existingPatient.address,
        emergencyContactName: body.emergencyContactName || existingPatient.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone || existingPatient.emergencyContactPhone,
        emergencyContactRelationship: body.emergencyContactRelationship || existingPatient.emergencyContactRelationship,
        knownAllergies: body.knownAllergies !== undefined ? body.knownAllergies : existingPatient.knownAllergies,
        chronicConditions: body.chronicConditions !== undefined ? body.chronicConditions : existingPatient.chronicConditions,
        currentMedications: body.currentMedications !== undefined ? body.currentMedications : existingPatient.currentMedications,
        status: body.status || existingPatient.status,
      },
    });

    return Response.json({
      message: 'Patient updated successfully',
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Update patient error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete patient (set status to INACTIVE)
export async function DELETE(request, { params }) {
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

    // Only admins can delete patients
    if (decoded.role !== 'ADMIN') {
      return Response.json(
        { error: 'Only administrators can delete patients' },
        { status: 403 }
      );
    }

    const patientId = params.id;

    // Verify patient exists and belongs to hospital
    const existingPatient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        hospitalId: decoded.hospitalId,
      },
    });

    if (!existingPatient) {
      return Response.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Soft delete (set status to INACTIVE)
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        status: 'INACTIVE',
      },
    });

    return Response.json({
      message: 'Patient deactivated successfully',
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}