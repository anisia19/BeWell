/*
import { useEffect, useState } from "react";
import { Heading, Text, Button } from "@chakra-ui/react";
import "../index.css";
import "./Patients.css";
import PatientCard from "../components/PatientCard";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import PatientGraph from "../components/PatientGraph";
type Patient = {
  id: number;
  name: string;
  gender: string;
  age: number | string | null;
  diagnosis: string | null;
  status: string;
  cnp: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => console.error("Error fetching patients:", err));
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetch(`http://localhost:3001/api/patients?search=${search}`)
        .then((res) => res.json())
        .then((data) => setPatients(data));
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

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
        <SearchBar
          className="search-bar-patients"
          placeholder="Search patients..."
          value={search}
          onChange={setSearch}
        />
      </div>
      <div className="patients-list-cards">
        {patients.map((p) => (
          <PatientCard
            cnp={p.cnp}
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
export default Dashboard;
*/