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
import { mockPatients } from "../data/mockPatients";
function Patients() {
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
        <Text fontSize="xs">X total patients</Text>
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
        {mockPatients.map((p) => (
          <PatientCard
            key={p.id}
            name={p.name}
            gender={p.gender}
            age={p.age}
            diagnosis={p.diagnosis}
            status={p.status}
            initials={p.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
            onClick={() => console.log(p.name)}
          />
        ))}
      </div>
    </>
  );
}

export default Patients;
