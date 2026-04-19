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

const Demo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => console.log(data));

  return (
    <div className="login-container">
      <h1>Welcome back to BeWell!</h1>
      <h2>Please log in below!</h2>
      <form onSubmit={onSubmit}>
        <Stack spacing="4" align="flex-start" maxW="sm">
          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input {...register("email", { required: "Email is required" })} />
            <FormErrorMessage>
              {errors.email && errors.email.message}
            </FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <FormLabel>Password</FormLabel>
            <Input
              {...register("password", { required: "Password is required" })}
            />
            <FormErrorMessage>
              {errors.password && errors.password.message}
            </FormErrorMessage>
          </FormControl>

          <Button type="submit" colorScheme="blue">
            Submit
          </Button>
        </Stack>
      </form>
    </div>
  );
};

export default Demo;
