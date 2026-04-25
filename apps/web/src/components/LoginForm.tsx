import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import "./LoginForm.css";

interface FormValues {
  email: string;
  password: string;
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => console.log(data));

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

          <Button type="submit">Log in</Button>
        </Stack>
      </form>
    </div>
  );
};

export default LoginForm;
