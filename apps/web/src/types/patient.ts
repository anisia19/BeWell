export type Gender = "UNSPECIFIED" | "FEMALE" | "MALE";
export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

export type PatientForm = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  cnp: string;
  dateOfBirth: string;
  age: string;
  gender: Gender;
  profession: string;
  workplace: string;
  role: UserRole;
};

export type Patient = PatientForm & {
  userId: number;
  patientId: number;
  generatedPassword?: string;
};

export type FormErrors = Partial<Record<keyof PatientForm, string>>;