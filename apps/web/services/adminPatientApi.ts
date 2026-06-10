import type { Patient, PatientForm, UserRole } from "../src/types/patient";

const API_URL = "http://localhost:3001/api/admin/patients";
const USERS_URL = "http://localhost:3001/api/admin/users";

export const getPatients = async (limit = 10, offset = 0): Promise<Patient[]> => {
  const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error("Could not fetch patients");
  return response.json();
};

export const getUsersByRole = async (
  role: UserRole,
  limit = 10,
  offset = 0
): Promise<Patient[]> => {
  const response = await fetch(`${USERS_URL}?role=${role}&limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error("Could not fetch users");
  return response.json();
};

export const createUser = async (data: PatientForm): Promise<Patient> => {
  const response = await fetch(USERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not create user");
  return result.user;
};

export const updateUser = async (
  userId: number,
  data: PatientForm
): Promise<void> => {
  const response = await fetch(`${USERS_URL}/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || "Could not update user");
  }
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