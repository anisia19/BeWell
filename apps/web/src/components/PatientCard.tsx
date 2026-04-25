import {
  Avatar,
  Card,
  CardBody,
  HStack,
  Text,
  Badge,
  Box,
} from "@chakra-ui/react";

import "./PatientCard.css";

type PatientCardProps = {
  name: string;
  gender: string;
  age: number;
  diagnosis: string;
  status: string;
  initials?: string;
  onClick?: () => void;
};

function PatientCard({
  name,
  gender,
  age,
  diagnosis,
  status,
  initials,
  onClick,
}: PatientCardProps) {
  return (
    <Card className="patient-card" onClick={onClick}>
      <CardBody className="patient-card-body">
        <HStack justify="space-between" align="center" w="100%">
          <HStack spacing={4}>
            <Avatar name={name} className="patient-avatar"></Avatar>
            <Box>
              <HStack spacing={2} mb={1}>
                <Text className="patient-name">{name}</Text>
                <Badge className="patient-gender">{gender}</Badge>
              </HStack>

              <Text className="patient-info">
                Age {age} · {diagnosis}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={4}>
            <Badge className="patient-status">{status}</Badge>
            <i className="bi bi-chevron-right patient-arrow"></i>
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
}

export default PatientCard;
