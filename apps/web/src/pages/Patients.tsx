import { useEffect, useState } from "react";
import {
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import "../index.css";
import "./Patients.css";
import PatientCard from "../components/PatientCard";
import { useNavigate } from "react-router-dom";

type Patient = {
  id: number;
  name: string;
  gender: string;
  age: number | string | null;
  diagnosis: string | null;
  status: string;
};

function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  return (
    <>
      <div className="patients-page">
        <div className="patients-header-row">
          <Heading as="h3" size="md">
            Patients
          </Heading>
          <Button
            variant="solid"
            colorScheme="green"
            onClick={() => console.log("Button clicked")}
          >
            <i className="bi bi-person-add button-icon-spacing"></i>
            Add Patient
          </Button>
        </div>
        <Text fontSize="xs">{patients.length} total patients</Text>
      </div>
      <div className="search-bar-patients">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <i className="bi bi-search"></i>
          </InputLeftElement>
          <Input placeholder="Search patients..." />
        </InputGroup>
      </div>
      <div className="patients-list-cards">
        {patients.map((p) => (
          <PatientCard
            variant="default"
            key={p.id}
            name={p.name}
            gender={p.gender}
            age={p.age ?? "N/A"}
            diagnosis={p.diagnosis || "No medical info added"}
            status={p.status}
            onClick={() => navigate(`/doctor/patient-details/${p.id}`)}
          />
        ))}
      </div>
    </>
  );
}

export default Patients;
