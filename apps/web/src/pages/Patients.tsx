import { Heading, Text, Button } from "@chakra-ui/react";
import "../index.css";
import "./Patients.css";
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
            <i className="bi bi-person-add"></i>
            Add Patient
          </Button>
        </div>
        <Text fontSize="xs">X total patients</Text>
      </div>
    </>
  );
}

export default Patients;
