# VoiceRX

A healthcare management system with voice-enabled features.

## Quick Start with Docker

**Prerequisites:** Docker Desktop installed and running

### One Command Setup

```bash
# Clone the repository
git clone https://github.com/MosesOnerhime/voicerx.git
cd voicerx
git checkout kosi-front

# Start everything
docker compose up
```

That's it! Wait for all services to start, then open:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001

### Demo Credentials

On the **Login page**, click "Demo Login" to auto-fill credentials.

On the **Sign Up page**, click "Fill Demo Data" to generate random hospital data.

## Project Structure

```
voicerx/
├── frontend-new/     # React + Vite frontend
├── backend/          # Next.js API backend
├── docker-compose.yml
└── README.md
```

## Manual Setup (Without Docker)

**Prerequisites:** Node.js 18+, PostgreSQL installed locally

### Step 1: Set Up Your Database

If you have PostgreSQL installed locally, create a database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE voicerx;
\q
```

### Step 2: Configure Environment

Create a `.env` file in the `backend/` folder:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with YOUR PostgreSQL credentials:

```env
# Replace with your local PostgreSQL credentials
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/voicerx"

# Keep these as-is for development
JWT_SECRET="your-secret-key-change-in-production"
OPENAI_API_KEY="your-openai-api-key"
```

**Examples:**
- Mac (default): `postgresql://postgres:postgres@localhost:5432/voicerx`
- Windows: `postgresql://postgres:yourpassword@localhost:5432/voicerx`
- Custom user: `postgresql://myuser:mypass@localhost:5432/voicerx`

### Step 3: Run Backend (Terminal 1)

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend runs at: **http://localhost:5001**

### Step 4: Run Frontend (Terminal 2)

Open a NEW terminal:

```bash
cd frontend-new
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Quick Reference

| Terminal | Folder | Command | URL |
|----------|--------|---------|-----|
| 1 | backend | `npm run dev` | http://localhost:5001 |
| 2 | frontend-new | `npm run dev` | http://localhost:5173 |

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router

**Backend:**
- Next.js 16 API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- OpenAI (Voice Transcription)

## Useful Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up --build

# Reset database
docker compose down -v
docker compose up
```

## Ports

| Service   | Port |
|-----------|------|
| Frontend  | 5173 |
| Backend   | 5001 |
| PostgreSQL| 5432 |
