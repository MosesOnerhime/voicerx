# Health Management System with AI Voice Documentation
## Product Requirements Document (PRD) v2.0

---

## 1. Executive Summary

### 1.1 Product Vision
A streamlined hospital health management system that moves patients through a single, continuous pipeline from registration to medication dispensing. The system uses AI-powered voice transcription to capture patient vitals and complaints, eliminating manual data entry while maintaining accurate records.

### 1.2 Core Principle
**One Appointment = One Continuous Pipeline**
```
Nurse → Doctor → Pharmacist/Referral
```
Each appointment flows through the entire healthcare journey without duplicate data entry.

### 1.3 Problem Statement
Healthcare providers spend significant time on:
- Manual data entry across disconnected systems
- Coordinating patient handoffs between staff
- Tracking doctor availability manually
- Re-entering the same patient information multiple times

### 1.4 Solution
An integrated system where:
1. Admin sets up hospital and uploads staff details
2. Nurse creates patient records and appointments
3. AI transcribes patient vitals/complaints via voice
4. Appointments flow automatically to assigned doctors
5. Status-based availability replaces manual coordination
6. Prescriptions flow directly to pharmacy

---

## 2. Streamlined Workflow

### 2.1 Complete Patient Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PATIENT JOURNEY PIPELINE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   STEP 1     │    │   STEP 2     │    │   STEP 3     │    │   STEP 4     │
│   ADMIN      │    │   NURSE/     │    │   VITALS     │    │   DOCTOR     │
│   SETUP      │    │  RECEPTION   │    │ COLLECTION   │    │  ASSIGNMENT  │
│              │ => │              │ => │              │ => │              │
│ • Register   │    │ • Create/    │    │ • Voice      │    │ • Assign to  │
│   hospital   │    │   find       │    │   capture    │    │   available  │
│ • Upload     │    │   patient    │    │ • Auto-link  │    │   doctor     │
│   staff      │    │ • Create     │    │   to appt    │    │ • Queue      │
│   document   │    │   appointment│    │              │    │   patient    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
                                                                    │
                    ┌───────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   STEP 5     │    │   STEP 6     │    │   STEP 7     │    │   STEP 8     │
│   WAITING    │    │   DOCTOR     │    │  REFERRAL/   │    │   PHARMACY   │
│   QUEUE      │    │ CONSULTATION │    │  MEDICATION  │    │              │
│              │ => │              │ => │              │ => │              │
│ • Status-    │    │ • View pre-  │    │ • Refer to   │    │ • Receive    │
│   based      │    │   filled     │    │   specialist │    │   linked     │
│   flow       │    │   data       │    │   OR         │    │   prescription│
│ • Auto       │    │ • Continue   │    │ • Send Rx    │    │ • Dispense   │
│   notify     │    │   documenting│    │   to pharmacy│    │   medication │
│   nurse      │    │              │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 3. User Roles & Access

### 3.1 Role Hierarchy

| Role | Primary Functions | Dashboard Access |
|------|------------------|------------------|
| **System Admin** | Hospital setup, staff management, system config | Full system access |
| **Nurse/Receptionist** | Patient registration, appointments, vitals | Patient queue, doctor status |
| **Doctor** | Consultations, prescriptions, referrals | Assigned appointments, patient data |
| **Pharmacist** | Medication dispensing | Prescription queue |

### 3.2 Access Control Structure

```
System Admin
├── Register hospital
├── Upload staff documents (doctors, nurses)
├── Manage user accounts
├── View all records
├── System configuration
│
Nurse/Receptionist
├── Create/search patient records
├── Create appointments
├── Record vitals (voice/manual)
├── Assign appointments to doctors
├── View doctor availability status
├── Receive "doctor free" notifications
│
Doctor
├── View assigned appointments (queue)
├── View patient data & vitals
├── Continue documentation
├── Create prescriptions
├── Refer to specialists
├── Update availability status (auto)
│
Pharmacist
├── View prescription queue
├── View patient & prescription details
├── Mark medications as dispensed
├── View dispensing history
```

---

## 4. Core Data Architecture

### 4.1 Entity Relationship Diagram

```
HOSPITAL (1) ────< (Many) USERS (Doctors, Nurses, Pharmacists)
    │
    └────< (Many) PATIENTS
                    │
                    └────< (Many) APPOINTMENTS
                                    │
                                    ├── VITALS_RECORD
                                    │
                                    ├── VOICE_TRANSCRIPT
                                    │
                                    ├── CONSULTATION_NOTES
                                    │
                                    ├── PRESCRIPTION
                                    │        │
                                    │        └────< (Many) PRESCRIPTION_ITEMS
                                    │
                                    └── REFERRAL (optional)
```

### 4.2 Data Models

#### 4.2.1 Hospital
```python
Hospital {
    id: UUID (Primary Key)
    
    # Business Info
    name: String
    email: String (unique)
    phone: String
    address: Text
    logo_url: String (optional)
    
    # Registration
    registration_number: String (optional)
    registered_at: DateTime
    
    # Status
    is_active: Boolean (default: True)
    
    # Metadata
    created_at: DateTime
    updated_at: DateTime
}
```

#### 4.2.2 User (Staff)
```python
User {
    id: UUID (Primary Key)
    hospital_id: FK → Hospital
    
    # Personal Info
    first_name: String
    last_name: String
    email: String (unique)
    phone: String
    
    # Role & Authentication
    role: Enum [Admin, Doctor, Nurse, Pharmacist]
    password_hash: String
    
    # Professional Info (for Doctors)
    specialization: String (nullable)
    license_number: String (nullable)
    
    # Availability (for Doctors)
    is_available: Boolean (default: True)
    current_appointment_id: FK → Appointment (nullable)
    
    # Status
    is_active: Boolean (default: True)
    last_login: DateTime (nullable)
    
    # Metadata
    created_at: DateTime
    updated_at: DateTime
}
```

#### 4.2.3 Patient
```python
Patient {
    id: UUID (Primary Key)
    hospital_id: FK → Hospital
    
    # Personal Information
    first_name: String
    last_name: String
    date_of_birth: Date
    gender: Enum [Male, Female, Other]
    blood_type: Enum [A+, A-, B+, B-, AB+, AB-, O+, O-] (nullable)
    genotype: Enum [AA, AS, SS, AC, SC] (nullable)
    
    # Contact Information
    phone_number: String
    email: String (optional)
    address: Text
    
    # Emergency Contact
    emergency_contact_name: String
    emergency_contact_phone: String
    emergency_contact_relationship: String
    
    # Medical Background (persists across appointments)
    known_allergies: JSON Array [{allergen, severity}]
    chronic_conditions: JSON Array [{condition, diagnosed_date}]
    current_medications: JSON Array [{name, dosage, frequency}]
    
    # Metadata
    patient_id_number: String (auto-generated, unique)
    registered_by: FK → User
    registered_at: DateTime
    updated_at: DateTime
    status: Enum [Active, Inactive]
}
```

#### 4.2.4 Appointment (Central Pipeline Entity)
```python
Appointment {
    id: UUID (Primary Key)
    appointment_number: String (auto-generated, unique, e.g., "APT-2025-001234")
    
    # Relationships
    hospital_id: FK → Hospital
    patient_id: FK → Patient
    
    # Staff Assignments
    created_by: FK → User (Nurse who created)
    assigned_doctor_id: FK → User (nullable)
    assigned_pharmacist_id: FK → User (nullable)
    referred_to_doctor_id: FK → User (nullable, for specialist referrals)
    
    # Timing
    created_at: DateTime
    doctor_assigned_at: DateTime (nullable)
    consultation_started_at: DateTime (nullable)
    consultation_completed_at: DateTime (nullable)
    completed_at: DateTime (nullable)
    
    # Pipeline Status
    status: Enum [
        Created,           # Nurse created appointment
        Vitals_Recorded,   # Vitals captured
        Assigned,          # Assigned to doctor
        In_Queue,          # Waiting for doctor
        In_Consultation,   # Doctor seeing patient
        Pending_Pharmacy,  # Prescription sent to pharmacy
        Pending_Referral,  # Referred to specialist
        Completed,         # Fully completed
        Cancelled
    ]
    
    # Priority
    priority: Enum [Normal, Urgent, Emergency] (default: Normal)
    
    # Chief Complaint (initial reason)
    chief_complaint: Text
    
    # Metadata
    updated_at: DateTime
}
```

#### 4.2.5 Vitals Record
```python
VitalsRecord {
    id: UUID (Primary Key)
    appointment_id: FK → Appointment (unique, one-to-one)
    
    # Vital Signs
    blood_pressure_systolic: Integer (nullable)
    blood_pressure_diastolic: Integer (nullable)
    pulse_rate: Integer (nullable)  # beats per minute
    temperature: Decimal (nullable)  # Celsius
    respiratory_rate: Integer (nullable)  # breaths per minute
    oxygen_saturation: Integer (nullable)  # SpO2 percentage
    weight: Decimal (nullable)  # kg
    height: Decimal (nullable)  # cm
    
    # Pain Assessment
    pain_level: Integer (nullable)  # 1-10 scale
    pain_location: String (nullable)
    
    # Patient Complaints (from voice or manual)
    symptoms_description: Text
    symptom_duration: String (nullable)
    
    # Voice Recording Reference
    has_voice_recording: Boolean (default: False)
    voice_transcript_id: FK → VoiceTranscript (nullable)
    
    # Recording Method
    recorded_via: Enum [Manual, Voice, Hybrid]
    
    # Metadata
    recorded_by: FK → User
    recorded_at: DateTime
}
```

#### 4.2.6 Voice Transcript
```python
VoiceTranscript {
    id: UUID (Primary Key)
    appointment_id: FK → Appointment
    
    # Audio Storage
    audio_file_url: String
    audio_duration_seconds: Integer
    
    # Transcription
    raw_transcript: Text
    
    # AI Extraction
    extracted_vitals: JSON {
        blood_pressure: String,
        temperature: String,
        symptoms: Array[String],
        pain_level: Integer,
        duration: String,
        ...
    }
    extraction_confidence: Decimal (0-1)
    
    # Processing Status
    transcription_status: Enum [Pending, Processing, Completed, Failed]
    
    # Metadata
    processed_at: DateTime (nullable)
    created_at: DateTime
}
```

#### 4.2.7 Consultation Notes
```python
ConsultationNotes {
    id: UUID (Primary Key)
    appointment_id: FK → Appointment (unique, one-to-one)
    
    # Clinical Notes
    history_of_present_illness: Text
    physical_examination: Text
    assessment: Text  # Doctor's assessment/diagnosis
    plan: Text  # Treatment plan
    
    # Diagnosis
    diagnosis_codes: JSON Array [{code, description}]  # ICD-10
    
    # Additional Notes
    additional_notes: Text (nullable)
    
    # Voice Documentation (optional)
    has_voice_recording: Boolean (default: False)
    voice_transcript_id: FK → VoiceTranscript (nullable)
    
    # Metadata
    created_by: FK → User (Doctor)
    created_at: DateTime
    updated_at: DateTime
}
```

#### 4.2.8 Prescription
```python
Prescription {
    id: UUID (Primary Key)
    prescription_number: String (auto-generated)
    appointment_id: FK → Appointment
    
    # Relationships
    patient_id: FK → Patient
    prescribed_by: FK → User (Doctor)
    assigned_pharmacist_id: FK → User (nullable)
    
    # Status
    status: Enum [Created, Sent_To_Pharmacy, Dispensing, Dispensed, Cancelled]
    
    # Pharmacy Notes
    pharmacist_notes: Text (nullable)
    
    # Timing
    prescribed_at: DateTime
    sent_to_pharmacy_at: DateTime (nullable)
    dispensed_at: DateTime (nullable)
    dispensed_by: FK → User (nullable)
    
    # Metadata
    created_at: DateTime
    updated_at: DateTime
}

PrescriptionItem {
    id: UUID (Primary Key)
    prescription_id: FK → Prescription
    
    # Medication Details
    medication_name: String
    dosage: String  # e.g., "500mg"
    frequency: String  # e.g., "3 times daily"
    duration: String  # e.g., "7 days"
    quantity: Integer
    
    # Instructions
    instructions: Text (nullable)  # e.g., "Take after meals"
    
    # Dispensing
    is_dispensed: Boolean (default: False)
    
    # Metadata
    created_at: DateTime
}
```

#### 4.2.9 Referral
```python
Referral {
    id: UUID (Primary Key)
    appointment_id: FK → Appointment
    
    # From/To
    referred_by: FK → User (Doctor)
    referred_to: FK → User (Specialist Doctor)
    
    # Details
    reason: Text
    urgency: Enum [Routine, Urgent, Emergency]
    
    # New Appointment (created when referral accepted)
    new_appointment_id: FK → Appointment (nullable)
    
    # Status
    status: Enum [Pending, Accepted, Declined, Completed]
    
    # Metadata
    created_at: DateTime
    responded_at: DateTime (nullable)
}
```

---

## 5. Feature Specifications

### 5.1 System Setup Module (Admin)

#### 5.1.1 Hospital Registration
**User Story:** As a system admin, I want to register my hospital so staff can use the system.

**Flow:**
1. Admin navigates to registration page
2. Enters hospital details (name, email, phone, address)
3. Creates admin account
4. Receives confirmation email
5. Accesses admin dashboard

**Fields:**
- Hospital name *
- Business email *
- Phone number *
- Address *
- Admin name *
- Admin email *
- Admin password *

#### 5.1.2 Staff Upload
**User Story:** As an admin, I want to upload a document with staff details to quickly onboard doctors and nurses.

**Accepted Formats:** CSV, Excel (XLSX)

**Required Columns:**
```
first_name | last_name | email | phone | role | specialization (if doctor)
```

**Flow:**
1. Admin uploads staff document
2. System validates data
3. Creates user accounts
4. Sends invitation emails with temporary passwords
5. Staff complete profile on first login

**Validation Rules:**
- Email must be unique
- Role must be: Doctor, Nurse, or Pharmacist
- Specialization required for Doctors

### 5.2 Patient Management Module (Nurse/Reception)

#### 5.2.1 Patient Registration
**User Story:** As a nurse, I want to quickly register new patients.

**Flow:**
1. Search for existing patient (by name, phone, or ID)
2. If not found, create new patient record
3. Enter required information
4. System generates unique Patient ID
5. Proceed to create appointment

**Required Fields:**
- Full name *
- Date of birth *
- Gender *
- Phone number *
- Emergency contact *

**Optional Fields:**
- Email
- Address
- Blood type
- Genotype
- Known allergies
- Chronic conditions
- Current medications

#### 5.2.2 Patient Search
**User Story:** As a nurse, I want to quickly find existing patients.

**Search By:**
- Patient ID number
- Full name (partial match)
- Phone number
- Date of birth

### 5.3 Appointment Module (Nurse/Reception)

#### 5.3.1 Create Appointment
**User Story:** As a nurse, I want to create an appointment for a patient.

**Flow:**
1. Select/create patient
2. Enter chief complaint
3. Set priority (Normal/Urgent/Emergency)
4. System generates Appointment ID
5. Appointment status = "Created"

**Auto-Generated:**
- Appointment number (APT-YYYY-XXXXXX)
- Created timestamp
- Created by (logged-in nurse)

### 5.4 Vitals Collection Module (Nurse)

#### 5.4.1 Voice-Enabled Vitals Capture
**User Story:** As a nurse, I want to record patient vitals using voice so I can focus on the patient.

**Activation:**
1. From appointment screen, tap "Record Vitals"
2. Choose mode: Voice / Manual / Hybrid
3. If Voice: Start recording conversation

**Voice Processing Pipeline:**
```
┌─────────────────────────────────────────────────────────────┐
│  VOICE VITALS CAPTURE PIPELINE                              │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 1: AUDIO CAPTURE                                     │
│  • Record nurse-patient conversation                        │
│  • Format: WAV/WebM (16kHz)                                │
│  • Local buffer for offline resilience                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 2: SPEECH-TO-TEXT (Whisper API)                     │
│  • Model: whisper-large-v3                                  │
│  • Language: Auto-detect (English, Pidgin, Yoruba, etc.)   │
│  • Output: Raw transcript                                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 3: AI EXTRACTION (GPT-4 / Claude)                   │
│  • Extract structured vitals from transcript                │
│  • Extract symptoms and complaints                          │
│  • Output: JSON with confidence scores                      │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  STAGE 4: AUTO-POPULATE VITALS FORM                        │
│  • Map extracted data to vitals fields                      │
│  • Nurse reviews and confirms                               │
│  • Link to appointment                                      │
└─────────────────────────────────────────────────────────────┘
```

**AI Extraction Prompt:**
```
You are a medical assistant. Extract vitals and symptoms from this 
nurse-patient conversation.

TRANSCRIPT:
{transcript}

Extract and return JSON:
{
  "blood_pressure": "120/80" or null,
  "pulse_rate": 78 or null,
  "temperature": 36.8 or null,
  "respiratory_rate": 18 or null,
  "oxygen_saturation": 98 or null,
  "weight": 70 or null,
  "pain_level": 6 or null,
  "pain_location": "head" or null,
  "symptoms": ["headache", "fever"],
  "duration": "3 days" or null,
  "chief_complaint": "Summary of main issue",
  "confidence": 0.85
}

Only extract explicitly mentioned information. Return null for missing data.
```

#### 5.4.2 Manual Vitals Entry
**User Story:** As a nurse, I want to manually enter vitals if voice isn't appropriate.

**Form Fields:**
- Blood Pressure (systolic/diastolic)
- Pulse Rate (bpm)
- Temperature (°C)
- Respiratory Rate
- Oxygen Saturation (%)
- Weight (kg)
- Height (cm)
- Pain Level (1-10)
- Pain Location
- Symptoms Description
- Duration

### 5.5 Doctor Assignment Module (Nurse)

#### 5.5.1 Assign to Doctor
**User Story:** As a nurse, I want to assign a patient to an available doctor.

**Flow:**
1. From appointment (after vitals recorded)
2. View list of doctors with availability status
3. Select doctor
4. Appointment appears in doctor's queue
5. Status changes to "Assigned" then "In_Queue"

**Doctor List View:**
```
┌─────────────────────────────────────────────────────────┐
│  AVAILABLE DOCTORS                                       │
├─────────────────────────────────────────────────────────┤
│  🟢 Dr. Chinedu Okafor    | General Practice | Queue: 2 │
│  🟢 Dr. Amina Ibrahim     | Pediatrics       | Queue: 0 │
│  🔴 Dr. Emeka Nwosu       | General Practice | Queue: 4 │
│  🟢 Dr. Fatima Aliyu      | Internal Med     | Queue: 1 │
└─────────────────────────────────────────────────────────┘

🟢 = Available (no current patient)
🔴 = Busy (with patient)
Queue = Number of waiting appointments
```

### 5.6 Doctor Dashboard Module

#### 5.6.1 Appointment Queue
**User Story:** As a doctor, I want to see my assigned appointments in order.

**Queue Features:**
- Chronological order (FIFO)
- Priority override (Emergency first)
- Patient summary card for each
- One-click to start consultation

**Queue Item Display:**
```
┌─────────────────────────────────────────────────────────┐
│  APPOINTMENT QUEUE                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔴 EMERGENCY - John Doe (APT-2025-001234)              │
│     M, 45 | Chest pain | Wait: 5 min                    │
│     [Start Consultation]                                │
│                                                         │
│  ⚪ Mary Smith (APT-2025-001235)                        │
│     F, 32 | Headache | Wait: 15 min                     │
│                                                         │
│  ⚪ Emeka Obi (APT-2025-001236)                         │
│     M, 28 | Follow-up | Wait: 20 min                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.6.2 Consultation View
**User Story:** As a doctor, I want to see all patient data and continue documentation.

**Pre-Populated Data:**
- Patient demographics
- Known allergies (⚠️ highlighted)
- Chronic conditions
- Current medications
- Today's vitals
- Chief complaint
- Voice transcript (if available)

**Doctor Can:**
- View/play voice recordings
- Add consultation notes
- Create prescription
- Refer to specialist
- Complete appointment

#### 5.6.3 Auto Status Update
**Implementation:**
- When doctor clicks "Start Consultation" → Status = "In_Consultation", Doctor = Busy
- When doctor clicks "Complete" → Status updates, Doctor = Available
- System notifies nurse that doctor is free

### 5.7 Notification System

#### 5.7.1 Real-Time Notifications

| Event | Notify | Method |
|-------|--------|--------|
| Doctor becomes available | Nurse | In-app + Sound |
| New appointment assigned | Doctor | In-app + Sound |
| Prescription sent | Pharmacist | In-app + Sound |
| Referral received | Specialist | In-app + Sound |

**WebSocket Events:**
```javascript
// Doctor availability changed
{
  "type": "doctor_status_changed",
  "doctor_id": "uuid",
  "is_available": true,
  "doctor_name": "Dr. Chinedu"
}

// New appointment in queue
{
  "type": "new_appointment",
  "appointment_id": "uuid",
  "patient_name": "John Doe",
  "priority": "urgent"
}

// Prescription ready
{
  "type": "prescription_ready",
  "prescription_id": "uuid",
  "patient_name": "John Doe"
}
```

### 5.8 Prescription Module (Doctor)

#### 5.8.1 Create Prescription
**User Story:** As a doctor, I want to prescribe medications that go directly to the pharmacy.

**Flow:**
1. From consultation, click "Create Prescription"
2. Add medication items (name, dosage, frequency, duration, quantity)
3. Add instructions if needed
4. Submit → Prescription sent to pharmacy
5. Appointment status = "Pending_Pharmacy"

### 5.9 Pharmacy Module

#### 5.9.1 Prescription Queue
**User Story:** As a pharmacist, I want to see prescriptions waiting to be dispensed.

**Queue View:**
```
┌─────────────────────────────────────────────────────────┐
│  PRESCRIPTION QUEUE                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Rx-2025-000123 | John Doe                              │
│  Dr. Chinedu | 3 items | 10 min ago                     │
│  [View Details] [Dispense]                              │
│                                                         │
│  Rx-2025-000124 | Mary Smith                            │
│  Dr. Amina | 2 items | 5 min ago                        │
│  [View Details] [Dispense]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### 5.9.2 Dispense Medication
**Flow:**
1. View prescription details
2. Verify patient identity
3. Prepare medications
4. Mark as dispensed
5. Appointment status = "Completed"

### 5.10 Referral Module (Doctor)

#### 5.10.1 Create Referral
**User Story:** As a doctor, I want to refer a patient to a specialist.

**Flow:**
1. From consultation, click "Refer to Specialist"
2. Select specialist doctor
3. Enter referral reason
4. Set urgency level
5. Submit → Specialist notified
6. Appointment status = "Pending_Referral"

**Referral creates new appointment linked to original.**

---

## 6. Technical Architecture

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│   │   Web App   │    │ Mobile App  │    │  Tablet App │            │
│   │   (React)   │    │(React Native│    │   (React)   │            │
│   │             │    │  + Expo)    │    │             │            │
│   └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Django REST API                          │  │
│   │                                                             │  │
│   │  REST Endpoints:                                            │  │
│   │  /api/v1/auth/           - Authentication                   │  │
│   │  /api/v1/hospitals/      - Hospital management              │  │
│   │  /api/v1/users/          - Staff management                 │  │
│   │  /api/v1/patients/       - Patient CRUD                     │  │
│   │  /api/v1/appointments/   - Appointment pipeline             │  │
│   │  /api/v1/vitals/         - Vitals recording                 │  │
│   │  /api/v1/prescriptions/  - Prescription management          │  │
│   │  /api/v1/referrals/      - Referral management              │  │
│   │                                                             │  │
│   │  WebSocket:                                                 │  │
│   │  /ws/notifications/      - Real-time notifications          │  │
│   │  /ws/voice/              - Voice streaming                  │  │
│   │                                                             │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Patient    │  │ Appointment  │  │    Voice     │              │
│  │   Service    │  │   Service    │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Prescription │  │ Notification │  │   Doctor     │              │
│  │   Service    │  │   Service    │  │   Service    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   OpenAI     │  │   AWS S3     │  │    Redis     │              │
│  │ Whisper API  │  │  (Storage)   │  │   (Cache/    │              │
│  │   GPT-4      │  │              │  │   Pub-Sub)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                                │
│  │   Celery     │  │   SendGrid   │                                │
│  │ (Task Queue) │  │   (Email)    │                                │
│  └──────────────┘  └──────────────┘                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     PostgreSQL                              │   │
│  │                                                             │   │
│  │  - hospitals        - appointments      - prescriptions     │   │
│  │  - users            - vitals_records    - prescription_items│   │
│  │  - patients         - voice_transcripts - referrals         │   │
│  │                     - consultation_notes                    │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Web** | React 18 + TypeScript | Admin, Nurse, Doctor, Pharmacist dashboards |
| **Frontend Mobile** | React Native + Expo | Mobile app for nurses (vitals capture) |
| **Backend** | Django 5.0 + DRF | REST API, business logic |
| **Database** | PostgreSQL 16 | Primary data store |
| **Cache/Pub-Sub** | Redis | Caching, real-time notifications |
| **Task Queue** | Celery | Async voice processing |
| **Real-time** | Django Channels | WebSocket notifications |
| **File Storage** | AWS S3 / Cloudinary | Audio files, documents |
| **Speech-to-Text** | OpenAI Whisper API | Voice transcription |
| **AI Extraction** | OpenAI GPT-4 / Claude | Medical data extraction |
| **Email** | SendGrid / Resend | Transactional emails |
| **Authentication** | Django Auth + JWT | Secure authentication |
| **Deployment** | Docker + Railway/AWS | Container deployment |

### 6.3 API Endpoints

#### Authentication
```
POST   /api/v1/auth/register/           # Hospital registration
POST   /api/v1/auth/login/              # User login
POST   /api/v1/auth/logout/             # User logout
POST   /api/v1/auth/refresh/            # Refresh JWT token
POST   /api/v1/auth/password-reset/     # Password reset
```

#### Hospital & Staff
```
GET    /api/v1/hospital/                # Get hospital details
PUT    /api/v1/hospital/                # Update hospital
POST   /api/v1/users/upload/            # Bulk upload staff
GET    /api/v1/users/                   # List staff
POST   /api/v1/users/                   # Create single user
GET    /api/v1/users/{id}/              # Get user details
PUT    /api/v1/users/{id}/              # Update user
GET    /api/v1/doctors/                 # List doctors with availability
GET    /api/v1/doctors/available/       # List available doctors only
```

#### Patients
```
GET    /api/v1/patients/                # List/search patients
POST   /api/v1/patients/                # Create patient
GET    /api/v1/patients/{id}/           # Get patient details
PUT    /api/v1/patients/{id}/           # Update patient
GET    /api/v1/patients/{id}/history/   # Get patient appointment history
```

#### Appointments
```
GET    /api/v1/appointments/            # List appointments (filterable)
POST   /api/v1/appointments/            # Create appointment
GET    /api/v1/appointments/{id}/       # Get appointment details
PUT    /api/v1/appointments/{id}/       # Update appointment
POST   /api/v1/appointments/{id}/assign/         # Assign to doctor
POST   /api/v1/appointments/{id}/start/          # Doctor starts consultation
POST   /api/v1/appointments/{id}/complete/       # Complete appointment
GET    /api/v1/appointments/queue/               # Get doctor's queue
GET    /api/v1/appointments/today/               # Today's appointments
```

#### Vitals
```
POST   /api/v1/vitals/                  # Record vitals (manual)
POST   /api/v1/vitals/voice/            # Record vitals (voice)
GET    /api/v1/vitals/{appointment_id}/ # Get vitals for appointment
PUT    /api/v1/vitals/{id}/             # Update vitals
```

#### Voice Processing
```
POST   /api/v1/voice/upload/            # Upload audio file
GET    /api/v1/voice/{id}/transcript/   # Get transcript
GET    /api/v1/voice/{id}/extracted/    # Get extracted data
```

#### Prescriptions
```
GET    /api/v1/prescriptions/           # List prescriptions
POST   /api/v1/prescriptions/           # Create prescription
GET    /api/v1/prescriptions/{id}/      # Get prescription details
POST   /api/v1/prescriptions/{id}/dispense/  # Mark as dispensed
GET    /api/v1/prescriptions/queue/     # Pharmacy queue
```

#### Referrals
```
GET    /api/v1/referrals/               # List referrals
POST   /api/v1/referrals/               # Create referral
GET    /api/v1/referrals/{id}/          # Get referral details
POST   /api/v1/referrals/{id}/accept/   # Accept referral
POST   /api/v1/referrals/{id}/decline/  # Decline referral
```

### 6.4 WebSocket Events

```javascript
// Connection
ws://api.example.com/ws/notifications/?token={jwt_token}

// Server → Client Events:

// Doctor availability changed
{
  "type": "doctor_availability",
  "data": {
    "doctor_id": "uuid",
    "doctor_name": "Dr. Chinedu",
    "is_available": true,
    "queue_count": 2
  }
}

// New appointment assigned
{
  "type": "appointment_assigned",
  "data": {
    "appointment_id": "uuid",
    "appointment_number": "APT-2025-001234",
    "patient_name": "John Doe",
    "priority": "urgent",
    "chief_complaint": "Chest pain"
  }
}

// Prescription ready for pharmacy
{
  "type": "prescription_ready",
  "data": {
    "prescription_id": "uuid",
    "prescription_number": "Rx-2025-000123",
    "patient_name": "John Doe",
    "item_count": 3
  }
}

// Referral received
{
  "type": "referral_received",
  "data": {
    "referral_id": "uuid",
    "from_doctor": "Dr. Chinedu",
    "patient_name": "John Doe",
    "urgency": "urgent"
  }
}
```

---

## 7. Mobile App (React Native)

### 7.1 Key Screens

1. **Login** - Staff authentication
2. **Patient Search/Register** - Find or create patients
3. **Create Appointment** - New appointment with chief complaint
4. **Vitals Capture** - Voice or manual vitals entry
5. **Doctor Assignment** - View available doctors, assign patient
6. **Queue View** - (For doctors) View appointment queue

### 7.2 Voice Recording (React Native)

```javascript
// Using expo-av
import { Audio } from 'expo-av';

const startVitalsRecording = async () => {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
  
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  
  return recording;
};

const stopAndUpload = async (recording, appointmentId) => {
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  
  // Upload to server
  const formData = new FormData();
  formData.append('audio', {
    uri,
    type: 'audio/wav',
    name: 'vitals.wav'
  });
  formData.append('appointment_id', appointmentId);
  
  const response = await fetch('/api/v1/vitals/voice/', {
    method: 'POST',
    body: formData,
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
};
```

### 7.3 Offline Support
- Local SQLite cache for patient records
- Queue voice recordings for upload
- Sync when connection restored
- Offline indicator in UI

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- [ ] Django project setup with DRF
- [ ] Database models (Hospital, User, Patient)
- [ ] Authentication (JWT)
- [ ] Hospital registration & staff upload
- [ ] Basic admin dashboard

### Phase 2: Core Pipeline (Weeks 3-4)
- [ ] Appointment model & API
- [ ] Patient registration & search
- [ ] Vitals model (manual entry)
- [ ] Doctor assignment flow
- [ ] Nurse dashboard

### Phase 3: Voice Integration (Weeks 5-6)
- [ ] Voice recording (web)
- [ ] Whisper API integration
- [ ] AI extraction with GPT-4
- [ ] Auto-populate vitals form
- [ ] Transcript storage

### Phase 4: Doctor & Pharmacy (Weeks 7-8)
- [ ] Doctor dashboard & queue
- [ ] Consultation notes
- [ ] Prescription creation
- [ ] Pharmacist dashboard
- [ ] Dispensing flow

### Phase 5: Real-time & Notifications (Weeks 9-10)
- [ ] Django Channels setup
- [ ] WebSocket notifications
- [ ] Doctor availability status
- [ ] Real-time queue updates
- [ ] Referral system

### Phase 6: Mobile App (Weeks 11-12)
- [ ] React Native setup
- [ ] Core screens
- [ ] Voice recording (mobile)
- [ ] Offline support basics

### Phase 7: Polish & Launch (Weeks 13-14)
- [ ] Security hardening
- [ ] Performance optimization
- [ ] User testing
- [ ] Documentation
- [ ] Deployment

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Patient registration time | < 2 minutes |
| Vitals capture time (voice) | < 3 minutes |
| Documentation time reduction | 50% decrease |
| Voice transcription accuracy | > 95% |
| Queue wait time visibility | 100% real-time |
| System uptime | 99.5% |

---

## 10. Security & Compliance

### 10.1 Data Protection
- AES-256 encryption at rest
- TLS 1.3 in transit
- Audio files encrypted
- PII in separate encrypted columns

### 10.2 Access Control
- Role-based access (RBAC)
- JWT with short expiry
- Session timeout (15 min idle)
- Audit logging

### 10.3 Nigeria Compliance
- NDPR compliance
- Patient consent for voice recording
- Data retention policies
- Right to deletion

---

*Document Version: 2.0*
*Last Updated: January 2025*
