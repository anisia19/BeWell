interface User {
  id: number;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  firstName: string;
  lastName: string;
}

export const checkAuth = (requiredRole: "PATIENT" | "DOCTOR" | "ADMIN"): boolean => {
  const userJson = localStorage.getItem("user");

  if (!userJson) {
    return false;
  }

  try {
    const user: User = JSON.parse(userJson);
    return user.role === requiredRole;
  } catch {
    localStorage.removeItem("user");
    return false;
  }
};
