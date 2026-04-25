import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import "./RegisterForm.css";

interface FormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: number;
}

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => console.log(data));

  return (
    <div className="register-page">
      <h1>Welcome to BeWell!</h1>
      <h2>Please create an account below!</h2>

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

          <FormControl isInvalid={!!errors.firstName}>
            <FormLabel>First name</FormLabel>
            <Input
              type="firstName"
              {...register("firstName", {
                required: "First name is required",
              })}
            />
            <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel>Last name</FormLabel>
            <Input
              type="lastName"
              {...register("lastName", {
                required: "Last name is required",
              })}
            />
            <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.phoneNumber}>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value:
                    /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  message: "Invalid phone number format",
                },
                minLength: {
                  value: 10,
                  message: "Phone number must be at least 10 digits",
                },
              })}
            />
            <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit">Create account</Button>
        </Stack>
      </form>
    </div>
  );
};

export default RegisterForm;
