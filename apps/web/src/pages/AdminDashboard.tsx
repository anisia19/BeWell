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
  Heading,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormErrors, Patient, PatientForm, UserRole } from "../types/patient";
import {
  createPatient,
  createUser,
  getPatients,
  getUsersByRole,
  updatePatient,
  updateUser,
} from "../../services/adminPatientApi";
import { validatePatientForm } from "../utils/patientValidation";
import SearchBar from "../components/SearchBar";

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
  birthCounty: "",
  country: "Romania",
  county: "",
  city: "",
  street: "",
  streetNumber: "",
  building: "",
  apartment: "",
  postalCode: "",
};

const countyCodes: Record<string, string> = {
  "01": "Alba",
  "02": "Arad",
  "03": "Arges",
  "04": "Bacau",
  "05": "Bihor",
  "06": "Bistrita-Nasaud",
  "07": "Botosani",
  "08": "Brasov",
  "09": "Braila",
  "10": "Buzau",
  "11": "Caras-Severin",
  "12": "Cluj",
  "13": "Constanta",
  "14": "Covasna",
  "15": "Dambovita",
  "16": "Dolj",
  "17": "Galati",
  "18": "Gorj",
  "19": "Harghita",
  "20": "Hunedoara",
  "21": "Ialomita",
  "22": "Iasi",
  "23": "Ilfov",
  "24": "Maramures",
  "25": "Mehedinti",
  "26": "Mures",
  "27": "Neamt",
  "28": "Olt",
  "29": "Prahova",
  "30": "Satu Mare",
  "31": "Salaj",
  "32": "Sibiu",
  "33": "Suceava",
  "34": "Teleorman",
  "35": "Timis",
  "36": "Tulcea",
  "37": "Vaslui",
  "38": "Valcea",
  "39": "Vrancea",
  "40": "Bucuresti",
  "41": "Bucuresti Sector 1",
  "42": "Bucuresti Sector 2",
  "43": "Bucuresti Sector 3",
  "44": "Bucuresti Sector 4",
  "45": "Bucuresti Sector 5",
  "46": "Bucuresti Sector 6",
  "51": "Calarasi",
  "52": "Giurgiu",
};

const AdminDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } =
    useDisclosure();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [users, setUsers] = useState<Patient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole>("PATIENT");

  const LIMIT = 10;
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const roleFilterRef = useRef<UserRole>("PATIENT");

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState<PatientForm>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;
    isFetchingRef.current = true;
    setIsFetchingUsers(true);
    try {
      const role = roleFilterRef.current;
      const batch =
        role === "PATIENT"
          ? await getPatients(LIMIT, offsetRef.current)
          : await getUsersByRole(role, LIMIT, offsetRef.current);
      setUsers((prev) => [...prev, ...batch]);
      offsetRef.current += batch.length;
      if (batch.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not load users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      isFetchingRef.current = false;
      setIsFetchingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    roleFilterRef.current = roleFilter;
    setUsers([]);
    setSearchQuery("");
    setDebouncedQuery("");
    offsetRef.current = 0;
    hasMoreRef.current = true;
    isFetchingRef.current = false;
    setHasMore(true);
    loadMore();
  }, [roleFilter, loadMore]);

  useEffect(() => {
    const sentinel = loaderRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const extractBirthDataFromCnp = (cnp: string) => {
    if (cnp.length < 7) return null;

    const s = Number(cnp[0]);
    const yy = Number(cnp.substring(1, 3));
    const mm = Number(cnp.substring(3, 5));
    const dd = Number(cnp.substring(5, 7));
    const countyCode = cnp.substring(7, 9);
    const birthCounty = countyCodes[countyCode] || "";

    let year = 0;
    if (s === 1 || s === 2) year = 1900 + yy;
    else if (s === 5 || s === 6) year = 2000 + yy;
    else if (s === 3 || s === 4) year = 1800 + yy;
    else return null;

    const birthDate = `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    const today = new Date();
    const birth = new Date(year, mm - 1, dd);
    let age = today.getFullYear() - birth.getFullYear();
    const hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() >= birth.getDate());
    if (!hasBirthdayPassed) age--;

    return { birthDate, age: age.toString(), birthCounty };
  };

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
        birthCounty: birthData?.birthCounty || "",
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "cnp") {
      const birthData = extractBirthDataFromCnp(value);
      setEditForm((prev) => ({
        ...prev,
        cnp: value,
        dateOfBirth: birthData?.birthDate || "",
        age: birthData?.age || "",
        birthCounty: birthData?.birthCounty || "",
      }));
      return;
    }
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditOpen = (patient: Patient) => {
    setEditingPatient(patient);
    setEditForm({
      email: patient.email ?? "",
      firstName: patient.firstName ?? "",
      lastName: patient.lastName ?? "",
      phone: patient.phone ?? "",
      cnp: patient.cnp ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      age: patient.age?.toString() ?? "",
      gender: patient.gender ?? "UNSPECIFIED",
      profession: patient.profession ?? "",
      workplace: patient.workplace ?? "",
      role: patient.role ?? "PATIENT",
      birthCounty: patient.birthCounty ?? "",
      country: patient.country ?? "",
      county: patient.county ?? "",
      city: patient.city ?? "",
      street: patient.street ?? "",
      streetNumber: patient.streetNumber ?? "",
      building: patient.building ?? "",
      apartment: patient.apartment ?? "",
      postalCode: patient.postalCode ?? "",
    });
    setEditErrors({});
    onEditOpen();
  };

  const handleSubmit = async () => {
    const validationErrors = validatePatientForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const created = form.role === "PATIENT"
        ? await createPatient(form)
        : await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setForm(emptyForm);
      setErrors({});
      setIsFormOpen(false);
      toast({
        title: "User created",
        description: `Generated password: ${created.generatedPassword}`,
        status: "success",
        duration: 7000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not create user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    const validationErrors = validatePatientForm(editForm);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setIsEditSubmitting(true);
      if (editingPatient!.role === "PATIENT") {
        await updatePatient(editingPatient!.patientId, editForm);
      } else {
        await updateUser(editingPatient!.userId, editForm);
      }
      setUsers((prev) =>
        prev.map((p) =>
          p.userId === editingPatient!.userId ? { ...p, ...editForm } : p
        )
      );
      onEditClose();
      toast({
        title: "User updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Could not update user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const filteredUsers = users.filter((p) => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (
      p.firstName?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.cnp?.includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Box p={8}>
      <HStack justify="space-between" mb={4}>
        <Heading>Admin Dashboard</Heading>
        <Button
          variant="outline"
          colorScheme="red"
          leftIcon={<i className="bi bi-box-arrow-right" />}
          onClick={handleLogout}
        >
          Log out
        </Button>
      </HStack>

      <SearchBar
        value={searchQuery}
        onChange={(v) => {
          setSearchQuery(v);
          if (v) setIsFormOpen(false);
        }}
        placeholder="Search by name, email or CNP..."
      />

      <HStack mt={6} mb={4} justify="space-between" align="center">
        <HStack spacing={4}>
          <Button
            colorScheme="green"
            onClick={() => {
              setIsFormOpen((prev) => !prev);
              setSearchQuery("");
              setForm(emptyForm);
              setErrors({});
            }}
          >
            {isFormOpen ? "Cancel" : "Add Patient"}
          </Button>

          <RadioGroup
            value={roleFilter}
            onChange={(v) => {
              setRoleFilter(v as UserRole);
              setIsFormOpen(false);
            }}
          >
            <HStack spacing={6}>
              <Radio value="PATIENT">Patients</Radio>
              <Radio value="DOCTOR">Doctors</Radio>
              <Radio value="ADMIN">Admins</Radio>
            </HStack>
          </RadioGroup>
        </HStack>
      </HStack>

      {isFormOpen && (
        <Box mb={8}>
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

            {form.role === "PATIENT" && (
              <>
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
              </>
            )}

            <FormControl>
              <FormLabel>Role</FormLabel>
              <RadioGroup
                value={form.role}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    role: value as UserRole,
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

            {form.role === "PATIENT" && (
              <>
                <FormControl>
                  <FormLabel>Birth County</FormLabel>
                  <Input name="birthCounty" value={form.birthCounty} readOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>Country</FormLabel>
                  <Input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>County</FormLabel>
                  <Input
                    name="county"
                    value={form.county}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Street</FormLabel>
                  <Input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Street Number</FormLabel>
                  <Input
                    name="streetNumber"
                    value={form.streetNumber}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Building</FormLabel>
                  <Input
                    name="building"
                    value={form.building}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Apartment</FormLabel>
                  <Input
                    name="apartment"
                    value={form.apartment}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Postal Code</FormLabel>
                  <Input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                  />
                </FormControl>
              </>
            )}
          </Grid>

          <Button
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Add Patient
          </Button>
        </Box>
      )}

      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Name</Th>
              <Th>Phone</Th>
              {roleFilter === "PATIENT" && (
                <>
                  <Th>CNP</Th>
                  <Th>Age</Th>
                  <Th>Gender</Th>
                  <Th>City</Th>
                </>
              )}
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {debouncedQuery && filteredUsers.length === 0 ? (
              <Tr>
                <Td colSpan={roleFilter === "PATIENT" ? 8 : 4} textAlign="center" py={10} color="gray.400">
                  <i className="bi bi-emoji-frown" style={{ fontSize: "2rem" }} />
                  <Box mt={2}>No results found for &ldquo;{debouncedQuery}&rdquo;</Box>
                </Td>
              </Tr>
            ) : (
              filteredUsers.map((user) => (
                <Tr key={user.userId}>
                  <Td>{user.email}</Td>
                  <Td>{user.firstName} {user.lastName}</Td>
                  <Td>{user.phone || "-"}</Td>
                  {roleFilter === "PATIENT" && (
                    <>
                      <Td>{user.cnp || "-"}</Td>
                      <Td>{user.age || "-"}</Td>
                      <Td>{user.gender || "-"}</Td>
                      <Td>{user.city || "-"}</Td>
                    </>
                  )}
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => handleEditOpen(user)}
                    >
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Box ref={loaderRef} py={6} textAlign="center">
        {isFetchingUsers && <Spinner color="green.400" />}
        {!hasMore && users.length > 0 && (
          <Text color="gray.400" fontSize="sm">All users loaded</Text>
        )}
      </Box>

      <Modal isOpen={isEditOpen} onClose={onEditClose} size="4xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <FormControl isInvalid={!!editErrors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
                <FormErrorMessage>{editErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!editErrors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                />
                <FormErrorMessage>{editErrors.firstName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!editErrors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                />
                <FormErrorMessage>{editErrors.lastName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!editErrors.phone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                />
                <FormErrorMessage>{editErrors.phone}</FormErrorMessage>
              </FormControl>

              {editForm.role === "PATIENT" && (
                <>
                  <FormControl isInvalid={!!editErrors.cnp}>
                    <FormLabel>CNP</FormLabel>
                    <Input
                      name="cnp"
                      value={editForm.cnp}
                      onChange={handleEditChange}
                    />
                    <FormErrorMessage>{editErrors.cnp}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      readOnly
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Age</FormLabel>
                    <Input name="age" type="number" value={editForm.age} readOnly />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                    >
                      <option value="UNSPECIFIED">UNSPECIFIED</option>
                      <option value="FEMALE">FEMALE</option>
                      <option value="MALE">MALE</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Profession</FormLabel>
                    <Input
                      name="profession"
                      value={editForm.profession}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Workplace</FormLabel>
                    <Input
                      name="workplace"
                      value={editForm.workplace}
                      onChange={handleEditChange}
                    />
                  </FormControl>
                </>
              )}

              {editForm.role === "PATIENT" && (
                <>
                  <FormControl>
                    <FormLabel>Birth County</FormLabel>
                    <Input name="birthCounty" value={editForm.birthCounty} readOnly />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Country</FormLabel>
                    <Input
                      name="country"
                      value={editForm.country}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>County</FormLabel>
                    <Input
                      name="county"
                      value={editForm.county}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>City</FormLabel>
                    <Input
                      name="city"
                      value={editForm.city}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Street</FormLabel>
                    <Input
                      name="street"
                      value={editForm.street}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Street Number</FormLabel>
                    <Input
                      name="streetNumber"
                      value={editForm.streetNumber}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Building</FormLabel>
                    <Input
                      name="building"
                      value={editForm.building}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Apartment</FormLabel>
                    <Input
                      name="apartment"
                      value={editForm.apartment}
                      onChange={handleEditChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Postal Code</FormLabel>
                    <Input
                      name="postalCode"
                      value={editForm.postalCode}
                      onChange={handleEditChange}
                    />
                  </FormControl>
                </>
              )}
            </Grid>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onEditClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleEditSubmit}
              isLoading={isEditSubmitting}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminDashboard;
