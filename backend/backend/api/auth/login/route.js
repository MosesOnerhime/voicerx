// ============================================================
// API ROUTE: /api/auth/login
// PRD Section: User Authentication
// ============================================================
// PURPOSE: Authenticate users and provide JWT token
// WHO CAN ACCESS: Anyone with valid credentials
// 
// WHAT IT DOES:
// 1. Verifies email and password
// 2. Generates JWT token for authentication
// 3. Sets token in httpOnly cookie (secure)
// 4. Returns user and hospital information
// ============================================================

import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d'; // Token valid for 7 days

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email and include hospital data
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
          },
        },
      },
    });

    // Check if user exists
    if (!user) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if hospital is active
    if (!user.hospital.isActive) {
      return Response.json(
        { error: 'Hospital account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return Response.json(
        { error: 'User account is inactive. Please contact your administrator.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token with user information
    const token = sign(
      {
        userId: user.id,
        hospitalId: user.hospitalId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Create response
    const response = Response.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
          isAvailable: user.isAvailable,
        },
        hospital: {
          id: user.hospital.id,
          name: user.hospital.name,
        },
        token: token, // Also send in response for manual storage if needed
      },
      { status: 200 }
    );

    // Set token in httpOnly cookie (more secure)
    response.headers.set(
      'Set-Cookie',
      `auth-token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}