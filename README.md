# VoiceRX - Healthcare Management System

A modern, voice-enabled healthcare management platform designed to streamline hospital operations, patient registration, appointment scheduling, and prescription management.

## Features

### Core Features
- **Patient Registration** - Register new patients with comprehensive medical history
- **Voice-Powered Data Entry** - Use AI (OpenAI Whisper + GPT-4o) to automatically fill forms by speaking
- **Appointment Management** - Create, schedule, and manage patient appointments
- **Vitals Recording** - Record patient vitals during intake with voice or manual entry
- **Prescription Management** - Doctors can prescribe medications, pharmacists can dispense
- **Role-Based Access Control** - Different dashboards for Admin, Doctor, Nurse, Pharmacist, and Receptionist

### Technical Features
- **Real-time Updates** - Live appointment queue updates
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Docker Support** - Easy deployment with Docker Compose
- **Optional AI** - App works fully without OpenAI API key (manual entry mode)

## Tech Stack

### Backend
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7
- **Authentication**: JWT with bcrypt
- **AI**: OpenAI Whisper (speech-to-text) + GPT-4o (data extraction)

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Radix UI + shadcn/ui

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- OpenAI API Key (optional - only needed for voice features)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/MosesOnerhime/voicerx.git
   cd voicerx
   ```

2. **Start the application**
   ```bash
   docker compose up -d
   ```

3. **Seed the database** (first time only)
   ```bash
   docker compose exec backend npx tsx prisma/seed.ts
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

### Enable Voice AI (Optional)

To enable voice-powered form filling:

```bash
export OPENAI_API_KEY="sk-proj-your-api-key"
docker compose up -d
```

### Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database URL
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd frontend-new
npm install
npm run dev
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@testhospital.com | TestPassword123 |
| Nurse | robert.jones@testhospital.com | Welcome@123 |
| Doctor | sarah.chen@testhospital.com | Welcome@123 |
| Pharmacist | mike.wilson@testhospital.com | Welcome@123 |
| Receptionist | jane.doe@testhospital.com | Welcome@123 |

## Project Structure

```
voicerx/
├── backend/                    # Next.js API Backend
│   ├── app/
│   │   └── api/               # API Routes
│   │       ├── auth/          # Authentication endpoints
│   │       ├── patients/      # Patient CRUD
│   │       ├── appointments/  # Appointment management
│   │       ├── prescriptions/ # Prescription management
│   │       ├── vitals/        # Vitals recording
│   │       ├── voice/         # Voice AI endpoints
│   │       └── admin/         # Admin endpoints
│   ├── lib/                   # Utilities (prisma, auth)
│   └── prisma/
│       ├── schema.prisma      # Database schema
│       └── seed.ts            # Database seeding
│
├── frontend-new/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── nurse/         # Nurse dashboard pages
│   │   │   └── pharmacy/      # Pharmacist dashboard pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service functions
│   │   └── store/             # Redux store
│   └── index.html
│
└── docker-compose.yml         # Docker orchestration
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Register new patient
- `GET /api/patients/:id` - Get patient details
- `PUT /api/patients/:id` - Update patient

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/queue` - Get appointment queue
- `POST /api/appointments/assign-doctor` - Assign doctor to appointment

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `POST /api/prescriptions/:id/dispense` - Dispense prescription

### Voice AI
- `GET /api/voice/status` - Check if AI is enabled
- `POST /api/voice/patient-registration` - Voice-to-form for patient registration
- `POST /api/voice` - Voice-to-form for vitals

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/voicerx"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-proj-..." # Optional
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:5001/api"
```

## User Roles & Permissions

| Feature | Admin | Doctor | Nurse | Pharmacist | Receptionist |
|---------|-------|--------|-------|------------|--------------|
| Register Patients | Yes | No | Yes | No | Yes |
| View Patients | Yes | Yes | Yes | Yes | Yes |
| Create Appointments | Yes | No | Yes | No | Yes |
| Record Vitals | Yes | No | Yes | No | No |
| Write Prescriptions | Yes | Yes | No | No | No |
| Dispense Medications | Yes | No | No | Yes | No |
| Manage Staff | Yes | No | No | No | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenAI](https://openai.com) - Whisper and GPT-4o for voice AI features
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Prisma](https://prisma.io) - Database ORM
