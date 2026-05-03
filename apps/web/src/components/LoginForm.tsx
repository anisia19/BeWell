import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./LoginForm.css";

interface FormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();
  const toast = useToast();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(result.user));
        toast({
          title: "Autentificare reușită!",
          description: "Bine ai revenit la BeWell.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Navighează în funcție de rol
        const redirectPath =
          result.user.role === "PATIENT"
            ? "/patient/dashboard"
            : "/doctor/dashboard";
        navigate(redirectPath);
      } else {
        toast({
          title: "Eroare",
          description: result.error || "A apărut o eroare",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Eroare",
        description: "Eroare de rețea. Te rugăm să încerci din nou.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  return (
    <div className="login-page">
      <h1>Welcome back to BeWell!</h1>
      <h2>Please log in below!</h2>

      <form onSubmit={onSubmit}>
        <Stack spacing="4" align="flex-start" maxW="sm">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              {...register("email", { required: "Email is required" })}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              {...register("password", {
                required: "Password is required",
              })}
            />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit" isLoading={isSubmitting}>
            Log in
          </Button>
        </Stack>
      </form>
    </div>
  );
};

export default LoginForm;
