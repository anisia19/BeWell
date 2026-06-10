import { Box, Card, Text, HStack, VStack, Icon, Badge, Flex } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import type { VitalStatus } from "../utils/vitalsClassifier";
import { STATUS_STYLES } from "../utils/vitalsClassifier";

interface SummaryCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: IconType;
  colorScheme: string;
  statusLabel?: string;
  vitalStatus?: VitalStatus;
}

const SummaryCard = ({
  label,
  value,
  unit,
  icon,
  colorScheme,
  statusLabel = "Normal",
  vitalStatus,
}: SummaryCardProps) => {
  const style = vitalStatus ? STATUS_STYLES[vitalStatus] : null;

  const cardBg = style?.cardBg ?? "white";
  const cardBorder = style?.cardBorder ?? "gray.100";
  const badgeColorScheme = style?.badgeColorScheme ?? "green";
  const badgeVariant = style?.badgeVariant ?? "subtle";
  const valueColor = style?.valueColor ?? "gray.800";
  const displayLabel = style?.label ?? statusLabel;

  return (
    <Card
      p={5}
      borderRadius="2xl"
      boxShadow="sm"
      border="1px"
      borderColor={cardBorder}
      bg={cardBg}
      transition="background 0.3s, border-color 0.3s"
    >
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align="center">
          <Box
            p={2}
            bg={`${colorScheme}.50`}
            borderRadius="lg"
            color={`${colorScheme}.500`}
            display="flex"
          >
            <Icon as={icon} boxSize={5} />
          </Box>
          <Badge
            colorScheme={badgeColorScheme}
            variant={badgeVariant}
            borderRadius="full"
            px={3}
            py={0.5}
            textTransform="none"
          >
            {displayLabel}
          </Badge>
        </Flex>

        <HStack align="baseline" spacing={1}>
          <Text fontSize="3xl" fontWeight="bold" color={valueColor}>
            {value}
          </Text>
          <Text fontSize="md" fontWeight="medium" color={valueColor === "gray.800" ? "gray.500" : valueColor}>
            {unit}
          </Text>
        </HStack>

        <Text fontSize="sm" fontWeight="medium" color="gray.500">
          {label}
        </Text>
      </VStack>
    </Card>
  );
};

export default SummaryCard;
