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
  age: number | string;
  diagnosis: string;
  status: string;
  alertsCount?: number;
  variant?: "default" | "compact";
  cnp: string;
  onClick?: () => void;
};

function PatientCard({
  name,
  gender,
  age,
  diagnosis,
  status,
  alertsCount = 0,
  variant = "default",
  cnp,
  onClick,
}: PatientCardProps) {
  return (
    <Card
      className={`patient-card ${
        variant === "compact" ? "patient-card-compact" : ""
      }`}
      onClick={onClick}
    >
      <CardBody className="patient-card-body">
        <HStack justify="space-between" align="center" w="100%">
          <HStack spacing={variant === "compact" ? 3 : 4}>
            <Avatar
              name={name}
              size={variant === "compact" ? "sm" : "md"}
              className="patient-avatar"
            />

            <Box>
              <HStack spacing={2} mb={1}>
                <Text
                  className={`patient-name ${
                    variant === "compact" ? "small" : ""
                  }`}
                >
                  {name}
                </Text>

                <Badge className="patient-gender">{gender}</Badge>
              </HStack>

              <Text
                className={`patient-info ${
                  variant === "compact" ? "small" : ""
                }`}
              >
                CNP {cnp}
              </Text>
              <Text
                className={`patient-info ${
                  variant === "compact" ? "small" : ""
                }`}
              >
                AGE {age} · {diagnosis}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={3}>
            {variant === "compact" ? (
              alertsCount > 0 && (
                <Badge className="patient-alert-count">{alertsCount}</Badge>
              )
            ) : (
              <>
                <Badge className="patient-status">{status}</Badge>
                <i className="bi bi-chevron-right patient-arrow"></i>
              </>
            )}
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
}

export default PatientCard;
