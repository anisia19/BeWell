import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <Box className="welcome-container">
      <VStack spacing={6}>
        <Heading size="lg">BeWell</Heading>

        <Text className="welcome-text">
          Welcome! Please login or create an account to continue.
        </Text>

        <div className="welcome-buttons">
          <Button
            colorScheme="teal"
            width="100%"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>

          <Button
            variant="outline"
            colorScheme="teal"
            width="100%"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </div>
      </VStack>
    </Box>
  );
}

export default Welcome;
