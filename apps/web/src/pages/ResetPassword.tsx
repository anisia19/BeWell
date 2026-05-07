import { Button, FormControl, FormLabel, Input, Stack, useToast, Text, Box } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/LoginForm.css";

const ResetPassword = () => {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const toast = useToast();
  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: state?.email, 
          code: data.code, 
          newPassword: data.newPassword 
        }),
      });

      if (res.ok) {
        toast({ title: "Succes!", description: "Parola a fost schimbată.", status: "success" });
        navigate("/login");
      } else {
        const result = await res.json();
        toast({ title: "Eroare", description: result.error, status: "error" });
      }
    } catch (e) {
      toast({ title: "Eroare server", status: "error" });
    }
  });

  return (
    <div className="login-page">
      <Box className="login-form-container">
        <h1>Setați Parola Nouă</h1>
        <Text color="green.300" mb={4}>Codul a fost trimis la: {state?.email}</Text>
        <form onSubmit={onSubmit}>
          <Stack spacing="4">
            <FormControl>
              <FormLabel>Cod de 6 cifre</FormLabel>
              <Input {...register("code", { required: true })} placeholder="123456" />
            </FormControl>
            <FormControl>
              <FormLabel>Noua Parolă</FormLabel>
              <Input type="password" {...register("newPassword", { required: true })} placeholder="********" />
            </FormControl>
            <Button type="submit" colorScheme="green" width="full">Actualizează Parola</Button>
          </Stack>
        </form>
      </Box>
    </div>
  );
};
export default ResetPassword;