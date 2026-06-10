import type { FormErrors, PatientForm } from "../types/patient";

export const validatePatientForm = (form: PatientForm): FormErrors => {
  const errors: FormErrors = {};

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Invalid email";
  }

  if (!form.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!form.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!/^07\d{8}$/.test(form.phone)) {
    errors.phone = "Phone must start with 07 and have 10 digits";
  }

  if (form.role === "PATIENT" && !/^\d{13}$/.test(form.cnp)) {
    errors.cnp = "CNP must have exactly 13 digits";
  }

  return errors;
};