import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Radio,
  RadioGroup,
  HStack,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { FormErrors, Patient, PatientForm } from "../types/patient";
import { createPatient, getPatients } from "../../services/adminPatientApi";
import { validatePatientForm } from "../utils/patientValidation";

const emptyForm: PatientForm = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  cnp: "",
  dateOfBirth: "",
  age: "",
  gender: "UNSPECIFIED",
  profession: "",
  workplace: "",
  role: "PATIENT",
};

const AdminDashboard = () => {
  const toast = useToast();

  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .catch(() => {
        toast({
          title: "Error",
          description: "Could not load patients",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "cnp") {
      const birthData = extractBirthDataFromCnp(value);

      setForm((prev) => ({
        ...prev,
        cnp: value,
        dateOfBirth: birthData?.birthDate || "",
        age: birthData?.age || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const extractBirthDataFromCnp = (cnp: string) => {
    if (cnp.length < 7) {
      return null;
    }

    const s = Number(cnp[0]);
    const yy = Number(cnp.substring(1, 3));
    const mm = Number(cnp.substring(3, 5));
    const dd = Number(cnp.substring(5, 7));

    let year = 0;

    if (s === 1 || s === 2) {
      year = 1900 + yy;
    } else if (s === 5 || s === 6) {
      year = 2000 + yy;
    } else if (s === 3 || s === 4) {
      year = 1800 + yy;
    } else {
      return null;
    }

    const birthDate = `${year}-${String(mm).padStart(2, "0")}-${String(
      dd
    ).padStart(2, "0")}`;

    const today = new Date();
    const birth = new Date(year, mm - 1, dd);

    let age = today.getFullYear() - birth.getFullYear();

    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());

    if (!hasBirthdayPassed) {
      age--;
    }

    return {
      birthDate,
      age: age.toString(),
    };
  };

  const handleSubmit = async () => {
    const validationErrors = validatePatientForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);

      const createdPatient = await createPatient(form);

      setPatients((prev) => [createdPatient, ...prev]);
      setForm(emptyForm);
      setErrors({});

      toast({
        title: "Patient created",
        description: `Generated password: ${createdPatient.generatedPassword}`,
        status: "success",
        duration: 7000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not create patient",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={8}>
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={6}>
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <Input name="email" value={form.email} onChange={handleChange} />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.firstName}>
          <FormLabel>First Name</FormLabel>
          <Input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.firstName}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.lastName}>
          <FormLabel>Last Name</FormLabel>
          <Input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
          <FormErrorMessage>{errors.lastName}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.phone}>
          <FormLabel>Phone</FormLabel>
          <Input name="phone" value={form.phone} onChange={handleChange} />
          <FormErrorMessage>{errors.phone}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.cnp}>
          <FormLabel>CNP</FormLabel>
          <Input name="cnp" value={form.cnp} onChange={handleChange} />
          <FormErrorMessage>{errors.cnp}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.dateOfBirth}>
          <FormLabel>Date of Birth</FormLabel>
          <Input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            readOnly
          />
          <FormErrorMessage>{errors.dateOfBirth}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.age}>
          <FormLabel>Age</FormLabel>
          <Input name="age" type="number" value={form.age} readOnly />
          <FormErrorMessage>{errors.age}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Gender</FormLabel>
          <Select name="gender" value={form.gender} onChange={handleChange}>
            <option value="UNSPECIFIED">UNSPECIFIED</option>
            <option value="FEMALE">FEMALE</option>
            <option value="MALE">MALE</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Profession</FormLabel>
          <Input
            name="profession"
            value={form.profession}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Workplace</FormLabel>
          <Input
            name="workplace"
            value={form.workplace}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Role</FormLabel>

          <RadioGroup
            value={form.role}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                role: value as "PATIENT" | "DOCTOR" | "ADMIN",
              }))
            }
          >
            <HStack spacing={6}>
              <Radio value="PATIENT">Patient</Radio>
              <Radio value="DOCTOR">Doctor</Radio>
              <Radio value="ADMIN">Admin</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
      </Grid>

      <Button
        colorScheme="green"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        mb={8}
      >
        Add Patient
      </Button>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>CNP</Th>
              <Th>Age</Th>
              <Th>Gender</Th>
              <Th>Profession</Th>
              <Th>Workplace</Th>
            </Tr>
          </Thead>

          <Tbody>
            {patients.map((patient) => (
              <Tr key={patient.patientId}>
                <Td>{patient.email}</Td>
                <Td>
                  {patient.firstName} {patient.lastName}
                </Td>
                <Td>{patient.phone}</Td>
                <Td>{patient.cnp}</Td>
                <Td>{patient.age}</Td>
                <Td>{patient.gender}</Td>
                <Td>{patient.profession || "-"}</Td>
                <Td>{patient.workplace || "-"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard;
