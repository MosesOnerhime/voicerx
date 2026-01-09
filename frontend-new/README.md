# VoiceRX Frontend

A modern healthcare management frontend built with React, TypeScript, and Vite.

## Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Redux Toolkit** - State Management
- **Axios** - HTTP Client
- **React Hook Form** - Form Handling
- **Zod** - Schema Validation
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment

The frontend connects to the backend API at `http://localhost:5001/api`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, etc.)
│   ├── auth.tsx        # Authentication API calls
│   ├── Gendashboard.tsx # Dashboard layout wrapper
│   ├── PatientCard.tsx  # Patient display card
│   └── ...
├── pages/              # Page components
│   ├── Register.tsx    # Login page
│   ├── SignUp.tsx      # Hospital registration
│   ├── AdminDBD.tsx    # Admin dashboard
│   └── nurse/          # Nurse-specific pages
│       ├── NurseOverview.tsx
│       ├── PatientsPage.tsx
│       └── RecordNewPatient.tsx
├── services/           # API services and types
│   ├── api/           # API call functions
│   └── types/         # TypeScript types
├── store/             # Redux store
│   ├── index.ts
│   └── authSlice.tsx
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── App.tsx            # Main app component
```

## Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Login page | Public |
| `/signup` | Hospital registration | Public |
| `/admin/dashboard` | Admin dashboard | Admin |
| `/nurse/dashboard` | Nurse queue overview | Nurse |
| `/nurse/patients` | Patient registry | Nurse |
| `/nurse/register-patient` | Register new patient | Nurse |

## Demo Credentials

For testing purposes, use the demo buttons on login/signup pages:

**Login Page:**
- Click "Demo Login" button
- Email: `admin@testhospital.com`
- Password: `TestPassword123`

**SignUp Page:**
- Click "Fill Demo Data" button
- Generates random Nigerian hospital data

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Features

- Hospital Registration & Authentication
- Role-based Dashboards (Admin, Nurse, Doctor, Pharmacist)
- Patient Management
- Appointment Queue System
- Vitals Recording
- Real-time Status Updates

## API Integration

The frontend communicates with the backend API:

- `POST /api/auth/register` - Hospital registration
- `POST /api/auth/login` - User login
- `GET /api/patients` - Get patients list
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment
