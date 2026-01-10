# VoiceRX Backend

A Next.js API backend for healthcare management with voice-enabled features.

## Tech Stack

- **Next.js 16** - API Routes
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **OpenAI** - Voice Transcription
- **Zod** - Validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### Database Setup

**Option 1: Docker (Recommended)**
```bash
docker run --name voicerx-postgres \
  -e POSTGRES_USER=voicerx \
  -e POSTGRES_PASSWORD=voicerx123 \
  -e POSTGRES_DB=voicerx \
  -p 5432:5432 \
  -d postgres:15
```

**Option 2: Local PostgreSQL**
```bash
createdb voicerx
createuser voicerx -P  # Set password: voicerx123
```

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server (runs on port 5001)
npm run dev
```

The API will be available at `http://localhost:5001`

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://voicerx:voicerx123@localhost:5432/voicerx"
JWT_SECRET="your-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
```

## Project Structure

```
├── app/
│   └── api/                 # API Routes
│       ├── auth/
│       │   ├── login/       # POST /api/auth/login
│       │   └── register/    # POST /api/auth/register
│       ├── patients/        # Patient CRUD
│       ├── appointments/    # Appointment management
│       ├── prescriptions/   # Prescription handling
│       ├── vitals/          # Vitals recording
│       ├── referrals/       # Referral system
│       ├── users/           # User management
│       └── voice/           # Voice transcription
├── lib/
│   ├── prisma.js           # Database client
│   ├── auth.js             # JWT utilities
│   └── notifications.js    # Real-time notifications
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
└── generated/
    └── prisma/             # Generated Prisma client
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register hospital + admin |
| POST | `/api/auth/login` | User login |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/[id]` | Get patient by ID |
| PUT | `/api/patients/[id]` | Update patient |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Create appointment |
| GET | `/api/appointments/queue` | Get doctor queue |
| POST | `/api/appointments/assign-doctor` | Assign doctor |
| POST | `/api/appointments/consultation` | Save consultation |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prescriptions` | List prescriptions |
| POST | `/api/prescriptions` | Create prescription |
| POST | `/api/prescriptions/[id]/dispense` | Dispense medication |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vitals` | Record vitals |
| POST | `/api/voice` | Voice transcription |
| POST | `/api/referrals` | Create referral |
| POST | `/api/users/upload` | Bulk user upload |

## Database Schema

### Main Models
- **Hospital** - Hospital registration info
- **User** - Staff (Admin, Doctor, Nurse, Pharmacist)
- **Patient** - Patient demographics
- **Appointment** - Patient journey tracking
- **VitalsRecord** - Patient vitals
- **Prescription** - Medications
- **Referral** - Specialist referrals

### User Roles
- `ADMIN` - Hospital administrator
- `DOCTOR` - Medical doctor
- `NURSE` - Nursing staff
- `PHARMACIST` - Pharmacy staff
- `RECEPTIONIST` - Front desk

### Appointment Status Flow
```
CREATED → VITALS_RECORDED → ASSIGNED → IN_QUEUE → IN_CONSULTATION → PENDING_PHARMACY/PENDING_REFERRAL → COMPLETED
```

## Scripts

```bash
npm run dev          # Start dev server (port 5001)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npx prisma studio    # Open Prisma database GUI
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:ci
```

## Demo Data

Register a test hospital:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalName": "Test Hospital",
    "email": "info@test.com",
    "phone": "+2341234567890",
    "address": "123 Test Street",
    "registrationNumber": "REG123",
    "adminFirstName": "John",
    "adminLastName": "Doe",
    "adminEmail": "admin@test.com",
    "adminPhone": "+2341234567890",
    "adminPassword": "TestPassword123"
  }'
```

Login:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestPassword123"
  }'
```
