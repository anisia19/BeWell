import { 
  Box, 
  Card, 
  Text, 
  HStack, 
  VStack, 
  Icon, 
  Badge, 
  Flex 
} from "@chakra-ui/react";

// Folosim importul de tip izolat pe o linie separată
import type { IconType } from "react-icons";

interface SummaryCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: IconType; // TypeScript va recunoaște acum importul de mai sus
  colorScheme: string;
  statusLabel?: string;
}

const SummaryCard = ({ 
  label, 
  value, 
  unit, 
  icon, 
  colorScheme, 
  statusLabel = "Normal" 
}: SummaryCardProps) => {
  return (
    <Card 
      p={5} 
      borderRadius="2xl" 
      boxShadow="sm" 
      border="1px" 
      borderColor="gray.100"
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
            colorScheme="green" 
            variant="subtle" 
            borderRadius="full" 
            px={3} 
            py={0.5}
            textTransform="none"
          >
            {statusLabel}
          </Badge>
        </Flex>

        <HStack align="baseline" spacing={1}>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            {value}
          </Text>
          <Text fontSize="md" fontWeight="medium" color="gray.500">
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