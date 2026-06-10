import type { Patient, PatientForm } from "../src/types/patient";

const API_URL = "http://localhost:3001/api/admin/patients";

export const getPatients = async (): Promise<Patient[]> => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Could not fetch patients");
  }

  return response.json();
};

export const updatePatient = async (
  patientId: number,
  data: PatientForm
): Promise<void> => {
  const response = await fetch(`${API_URL}/${patientId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Could not update patient");
  }
};

export const createPatient = async (data: PatientForm): Promise<Patient> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Could not create patient");
  }

  return result.patient;
};