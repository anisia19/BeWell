import {
  Box,
  Button,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
} from "@chakra-ui/react";
import { useState } from "react";

const AdminDashboard = () => {
  const [search, setSearch] = useState("");

  return (
    <Box p={8}>
      <Heading size="lg" mb={6}>
        Admin Dashboard
      </Heading>

      <HStack mb={6} spacing={4}>
        <Input
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
        />

        <Button colorScheme="green">Add Patient</Button>
      </HStack>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>Email</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td>1</Td>
              <Td>John</Td>
              <Td>Doe</Td>
              <Td>john@example.com</Td>
              <Td>
                <HStack spacing={2}>
                  <Button size="sm" colorScheme="blue">
                    Edit
                  </Button>
                  <Button size="sm" colorScheme="red">
                    Delete
                  </Button>
                </HStack>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminDashboard;
