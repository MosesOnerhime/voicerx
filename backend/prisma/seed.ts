import 'dotenv/config';
import { PrismaClient, BloodType, Genotype, Gender, UserRole, PatientStatus } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  // Create hospital
  const hospital = await prisma.hospital.upsert({
    where: { id: 'test-hospital-001' },
    update: {},
    create: {
      id: 'test-hospital-001',
      name: 'Test General Hospital',
      address: '123 Medical Drive, Lagos',
      phone: '+234 800 000 0001',
      email: 'admin@testhospital.com',
    },
  });
  console.log('Created hospital:', hospital.name);

  // Hash password
  const hashedPassword = await bcrypt.hash('Welcome@123', 10);
  const adminPassword = await bcrypt.hash('TestPassword123', 10);

  // Create Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@testhospital.com' },
    update: {},
    create: {
      email: 'admin@testhospital.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+234 800 000 0010',
      role: UserRole.ADMIN,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created admin:', admin.email);

  // Create Nurse
  const nurse = await prisma.user.upsert({
    where: { email: 'robert.jones@testhospital.com' },
    update: {},
    create: {
      email: 'robert.jones@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Robert',
      lastName: 'Jones',
      phone: '+234 800 000 0011',
      role: UserRole.NURSE,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created nurse:', nurse.email);

  // Create Doctors (matching frontend demo accounts)
  const doctorJohn = await prisma.user.upsert({
    where: { email: 'john.smith@testhospital.com' },
    update: {},
    create: {
      email: 'john.smith@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+234 800 000 0012',
      role: UserRole.DOCTOR,
      specialization: 'General Practice',
      hospitalId: hospital.id,
      isActive: true,
      isAvailable: true,
    },
  });
  console.log('Created doctor:', doctorJohn.email);

  const doctorMary = await prisma.user.upsert({
    where: { email: 'mary.johnson@testhospital.com' },
    update: {},
    create: {
      email: 'mary.johnson@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Mary',
      lastName: 'Johnson',
      phone: '+234 800 000 0015',
      role: UserRole.DOCTOR,
      specialization: 'Internal Medicine',
      hospitalId: hospital.id,
      isActive: true,
      isAvailable: true,
    },
  });
  console.log('Created doctor:', doctorMary.email);

  // Keep Sarah Chen as well
  const doctorSarah = await prisma.user.upsert({
    where: { email: 'sarah.chen@testhospital.com' },
    update: {},
    create: {
      email: 'sarah.chen@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+234 800 000 0016',
      role: UserRole.DOCTOR,
      specialization: 'Pediatrics',
      hospitalId: hospital.id,
      isActive: true,
      isAvailable: true,
    },
  });
  console.log('Created doctor:', doctorSarah.email);

  // Create Pharmacists (matching frontend demo accounts)
  const pharmacistDavid = await prisma.user.upsert({
    where: { email: 'david.moore@testhospital.com' },
    update: {},
    create: {
      email: 'david.moore@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'David',
      lastName: 'Moore',
      phone: '+234 800 000 0017',
      role: UserRole.PHARMACIST,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created pharmacist:', pharmacistDavid.email);

  const pharmacistJennifer = await prisma.user.upsert({
    where: { email: 'jennifer.taylor@testhospital.com' },
    update: {},
    create: {
      email: 'jennifer.taylor@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Jennifer',
      lastName: 'Taylor',
      phone: '+234 800 000 0018',
      role: UserRole.PHARMACIST,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created pharmacist:', pharmacistJennifer.email);

  // Create second Nurse (matching frontend demo accounts)
  const nurseLinda = await prisma.user.upsert({
    where: { email: 'linda.davis@testhospital.com' },
    update: {},
    create: {
      email: 'linda.davis@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Linda',
      lastName: 'Davis',
      phone: '+234 800 000 0019',
      role: UserRole.NURSE,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created nurse:', nurseLinda.email);

  // Create a sample patient using raw enum string values (required for pg adapter)
  const patient = await prisma.patient.upsert({
    where: { patientIdNumber: 'P000001' },
    update: {},
    create: {
      patientIdNumber: 'P000001',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE' as Gender,
      phoneNumber: '+234 801 234 5678',
      email: 'john.smith@email.com',
      address: '456 Patient Street, Lagos',
      bloodType: 'O_POSITIVE' as BloodType,
      genotype: 'AA' as Genotype,
      emergencyContactName: 'Mary Smith',
      emergencyContactPhone: '+234 802 345 6789',
      emergencyContactRelationship: 'SPOUSE',
      hospitalId: hospital.id,
      registeredBy: nurse.id,
      status: 'ACTIVE' as PatientStatus,
    },
  });
  console.log('Created patient:', patient.firstName, patient.lastName);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
