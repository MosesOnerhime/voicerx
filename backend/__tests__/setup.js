// Jest test setup
// This file runs before each test file

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-testing';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://voicerx:voicerx123@localhost:5432/voicerx';

// Global test timeout
jest.setTimeout(30000);
