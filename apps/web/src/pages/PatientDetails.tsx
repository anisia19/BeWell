import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { VStack, Spinner, Text } from "@chakra-ui/react";

import PatientCard from "../components/PatientCard";
import AllChartsData from "../components/AllChartsData";
import PatientTabs from "../components/PatientTabs";

type Patient = {
  id: string;
  name: string;
  gender: string;
  age: number | string;
  diagnosis: string;
  status: string;
  cnp: string;
};

const PatientDetails = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/patients/${id}`
        );

        if (!response.ok) {
          throw new Error("Patient not found");
        }

        const data = await response.json();

        const mappedPatient: Patient = {
          id: data.id,
          name:
            data.name ||
            data.full_name ||
            `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            "Unknown patient",
          gender: data.gender || "Unspecified",
          age: data.age || "-",
          diagnosis: data.diagnosis || data.medical_history || "No diagnosis",
          status: data.status || "Stable",
          cnp: data.cnp || "N/A",
        };

        setPatient(mappedPatient);
      } catch (error) {
        console.error("Error fetching patient:", error);
        setPatient(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPatient();
  }, [id]);

  if (loading) return <Spinner />;

  if (!patient) return <Text>Patient not found.</Text>;

  return (
    <>
      <VStack spacing={5} align="stretch" w="100%">
        <PatientCard
          variant="details"
          name={patient.name}
          gender={patient.gender}
          age={patient.age}
          diagnosis={patient.diagnosis}
          status={patient.status}
          cnp={patient.cnp}
        />
      </VStack>

      <PatientTabs />
    </>
  );
};

export default PatientDetails;
