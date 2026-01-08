// ============================================================
// REAL-TIME NOTIFICATIONS MANAGER
// PRD Section 5.7: Notification System
// ============================================================
// Uses Server-Sent Events (SSE) for real-time updates
// Supports multiple notification types per PRD

// Store connected clients by hospital and user
const clients = new Map(); // hospitalId -> Map(userId -> Set(controllers))

// Add a client connection
export function addClient(hospitalId, userId, controller) {
  if (!clients.has(hospitalId)) {
    clients.set(hospitalId, new Map());
  }
  const hospitalClients = clients.get(hospitalId);

  if (!hospitalClients.has(userId)) {
    hospitalClients.set(userId, new Set());
  }
  hospitalClients.get(userId).add(controller);

  console.log(`Client connected: hospital=${hospitalId}, user=${userId}`);
}

// Remove a client connection
export function removeClient(hospitalId, userId, controller) {
  if (clients.has(hospitalId)) {
    const hospitalClients = clients.get(hospitalId);
    if (hospitalClients.has(userId)) {
      hospitalClients.get(userId).delete(controller);
      if (hospitalClients.get(userId).size === 0) {
        hospitalClients.delete(userId);
      }
    }
    if (hospitalClients.size === 0) {
      clients.delete(hospitalId);
    }
  }
  console.log(`Client disconnected: hospital=${hospitalId}, user=${userId}`);
}

// Send notification to specific user
export function notifyUser(hospitalId, userId, event) {
  if (clients.has(hospitalId)) {
    const hospitalClients = clients.get(hospitalId);
    if (hospitalClients.has(userId)) {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      hospitalClients.get(userId).forEach((controller) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch (e) {
          console.error('Error sending to client:', e);
        }
      });
    }
  }
}

// Send notification to all users in a hospital with a specific role
export function notifyRole(hospitalId, role, event) {
  // This requires knowing user roles - we'll broadcast to all and let client filter
  notifyHospital(hospitalId, { ...event, targetRole: role });
}

// Send notification to all users in a hospital
export function notifyHospital(hospitalId, event) {
  if (clients.has(hospitalId)) {
    const hospitalClients = clients.get(hospitalId);
    const data = `data: ${JSON.stringify(event)}\n\n`;
    hospitalClients.forEach((userControllers) => {
      userControllers.forEach((controller) => {
        try {
          controller.enqueue(new TextEncoder().encode(data));
        } catch (e) {
          console.error('Error sending to client:', e);
        }
      });
    });
  }
}

// ============================================================
// NOTIFICATION EVENT TYPES (from PRD Section 5.7.1)
// ============================================================

// Doctor becomes available - notify nurses
export function notifyDoctorAvailable(hospitalId, doctor) {
  notifyHospital(hospitalId, {
    type: 'doctor_availability',
    data: {
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      isAvailable: true,
      queueCount: doctor.queueCount || 0,
    },
    targetRole: 'NURSE',
    timestamp: new Date().toISOString(),
  });
}

// Doctor becomes busy - notify nurses
export function notifyDoctorBusy(hospitalId, doctor) {
  notifyHospital(hospitalId, {
    type: 'doctor_availability',
    data: {
      doctorId: doctor.id,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      specialization: doctor.specialization,
      isAvailable: false,
    },
    targetRole: 'NURSE',
    timestamp: new Date().toISOString(),
  });
}

// New appointment assigned to doctor
export function notifyNewAppointment(hospitalId, doctorId, appointment) {
  notifyUser(hospitalId, doctorId, {
    type: 'appointment_assigned',
    data: {
      appointmentId: appointment.id,
      appointmentNumber: appointment.appointmentNumber,
      patientName: `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
      priority: appointment.priority,
      chiefComplaint: appointment.chiefComplaint,
    },
    timestamp: new Date().toISOString(),
  });
}

// Prescription sent to pharmacy
export function notifyPrescriptionReady(hospitalId, prescription) {
  notifyHospital(hospitalId, {
    type: 'prescription_ready',
    data: {
      prescriptionId: prescription.id,
      prescriptionNumber: prescription.prescriptionNumber,
      patientName: `${prescription.patient?.firstName} ${prescription.patient?.lastName}`,
      itemCount: prescription.items?.length || 0,
      doctorName: prescription.prescribedByUser
        ? `Dr. ${prescription.prescribedByUser.firstName} ${prescription.prescribedByUser.lastName}`
        : null,
    },
    targetRole: 'PHARMACIST',
    timestamp: new Date().toISOString(),
  });
}

// Referral received by specialist
export function notifyReferralReceived(hospitalId, specialistId, referral) {
  notifyUser(hospitalId, specialistId, {
    type: 'referral_received',
    data: {
      referralId: referral.id,
      fromDoctor: referral.referredByUser
        ? `Dr. ${referral.referredByUser.firstName} ${referral.referredByUser.lastName}`
        : null,
      patientName: referral.appointment?.patient
        ? `${referral.appointment.patient.firstName} ${referral.appointment.patient.lastName}`
        : null,
      urgency: referral.urgency,
      reason: referral.reason,
    },
    timestamp: new Date().toISOString(),
  });
}

// Queue update - broadcast to all in hospital
export function notifyQueueUpdate(hospitalId, doctorId, queueInfo) {
  notifyHospital(hospitalId, {
    type: 'queue_update',
    data: {
      doctorId,
      queueCount: queueInfo.count,
      nextPatient: queueInfo.nextPatient,
    },
    timestamp: new Date().toISOString(),
  });
}

// Appointment status changed
export function notifyAppointmentStatusChange(hospitalId, appointment) {
  notifyHospital(hospitalId, {
    type: 'appointment_status_changed',
    data: {
      appointmentId: appointment.id,
      appointmentNumber: appointment.appointmentNumber,
      status: appointment.status,
      patientName: appointment.patient
        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
        : null,
    },
    timestamp: new Date().toISOString(),
  });
}
