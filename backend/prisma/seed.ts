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

  // Create Doctor
  const doctor = await prisma.user.upsert({
    where: { email: 'sarah.chen@testhospital.com' },
    update: {},
    create: {
      email: 'sarah.chen@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Chen',
      phone: '+234 800 000 0012',
      role: UserRole.DOCTOR,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created doctor:', doctor.email);

  // Create Pharmacist
  const pharmacist = await prisma.user.upsert({
    where: { email: 'mike.wilson@testhospital.com' },
    update: {},
    create: {
      email: 'mike.wilson@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Mike',
      lastName: 'Wilson',
      phone: '+234 800 000 0013',
      role: UserRole.PHARMACIST,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created pharmacist:', pharmacist.email);

  // Create Receptionist
  const receptionist = await prisma.user.upsert({
    where: { email: 'jane.doe@testhospital.com' },
    update: {},
    create: {
      email: 'jane.doe@testhospital.com',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+234 800 000 0014',
      role: UserRole.RECEPTIONIST,
      hospitalId: hospital.id,
      isActive: true,
    },
  });
  console.log('Created receptionist:', receptionist.email);

  // Create a sample patient
  const patient = await prisma.patient.upsert({
    where: { patientIdNumber: 'P000001' },
    update: {},
    create: {
      patientIdNumber: 'P000001',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: new Date('1990-05-15'),
      gender: Gender.MALE,
      phoneNumber: '+234 801 234 5678',
      email: 'john.smith@email.com',
      address: '456 Patient Street, Lagos',
      bloodType: BloodType.O_POSITIVE,
      genotype: Genotype.AA,
      emergencyContactName: 'Mary Smith',
      emergencyContactPhone: '+234 802 345 6789',
      emergencyContactRelationship: 'SPOUSE',
      hospitalId: hospital.id,
      registeredBy: nurse.id,
      status: PatientStatus.ACTIVE,
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
