import { Button, FormControl, FormLabel, Input, Stack, useToast, Text, Box } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../components/LoginForm.css";

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        toast({ title: "Cod trimis!", description: "Verifică email-ul.", status: "success" });
        navigate("/reset-password", { state: { email: data.email } });
      } else {
        toast({ title: "Eroare", description: result.error, status: "error" });
      }
    } catch (e) {
      toast({ title: "Eroare server", status: "error" });
    }
  });

  return (
    <div className="login-page">
      <Box className="login-form-container">
        <h1>Recuperare Cont</h1>
        <Text color="gray.400" mb={4}>Introdu email-ul pentru a primi codul.</Text>
        <form onSubmit={onSubmit}>
          <Stack spacing="4">
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" {...register("email", { required: true })} placeholder="email@bewell.com" />
            </FormControl>
            <Button type="submit" colorScheme="green" width="full">Trimite Codul</Button>
          </Stack>
        </form>
      </Box>
    </div>
  );
};
export default ForgotPassword;