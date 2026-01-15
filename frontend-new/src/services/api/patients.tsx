// services/api/patients.ts
export const patientApi = {
  getAll: async (token: string) => {
    const response = await fetch("http://localhost:5001/api/patients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch patients");
    }

    const data = await response.json();
    // Your backend returns { patients: [...], pagination: {...} }
    return data.patients; // Return just the patients array
  },
};