import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-page">
      <Box className="welcome-container">
        <VStack spacing={5}>
          <Heading size="lg" className="welcome-title">
            BeWell
          </Heading>

          <Text className="welcome-text">
            Welcome! Please login or create an account to continue.
          </Text>

          <div className="welcome-buttons">
            <Button className="primary" onClick={() => navigate("/login")}>
              Login
            </Button>

            <Button className="secondary" onClick={() => navigate("/register")}>
              Register
            </Button>
          </div>
        </VStack>
      </Box>
    </div>
  );
}

export default Welcome;
