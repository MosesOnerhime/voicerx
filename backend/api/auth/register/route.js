import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  hospitalName: z.string().min(2, 'Hospital name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(10, 'Valid phone number required'),
  registrationNumber: z.string().min(5, 'Registration number required'),
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if hospital already exists
    const existingHospital = await prisma.hospital.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { registrationNumber: validatedData.registrationNumber }
        ]
      }
    });
    
    if (existingHospital) {
      return NextResponse.json(
        { error: 'Hospital with this email or registration number already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create hospital
    const hospital = await prisma.hospital.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        hospitalName: true,
        email: true,
        address: true,
        phone: true,
        registrationNumber: true,
        isVerified: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json(
      { 
        message: 'Hospital registered successfully',
        hospital 
      },
      { status: 201 }
    );
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}