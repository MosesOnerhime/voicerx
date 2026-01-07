import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find hospital
    const hospital = await prisma.hospital.findUnique({
      where: { email },
    });
    
    if (!hospital) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, hospital.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        hospitalId: hospital.id,
        email: hospital.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return hospital data without password
    const { password: _, ...hospitalData } = hospital;
    
    return NextResponse.json({
      message: 'Login successful',
      token,
      hospital: hospitalData,
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}