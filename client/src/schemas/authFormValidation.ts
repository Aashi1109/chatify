import { getUserByUsername } from "@/actions/form";
import * as Yup from "yup";

const authFormValidationSchemaWrapper = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password should be 8 characters long.")
    .required("Password is required."),
  confirmPassword: Yup.string().when("$isLoginForm", {
    is: false,
    then: (schema) =>
      schema
        .required("Confirm password is required")
        .oneOf(
          [Yup.ref("password")],
          "Password and Confirm Password must be the same"
        ),
    otherwise: (schema) => schema.nullable(),
  }),
  name: Yup.string().when("$isLoginForm", {
    is: false,
    then: (schema) =>
      schema
        .min(3, "Full name should be min 3 chars.")
        .required("Full name is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  about: Yup.string().optional().min(5, "More than 5 characters required."),
  rememberMe: Yup.boolean().optional(),
  username: Yup.string()
    .required("Username is required")
    .min(3, "Username must be between 3 and 20 characters long")
    .max(20, "Username must be between 3 and 20 characters long")
    .matches(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers"),
});

export const validateUsername = async (
  value: string | undefined,
  returnResult = false
) => {
  if (!value) {
    return "Username is required";
  }
  if (value.length > 20 || value.length < 3) {
    return "Username must be between 3 and 20 characters long";
  }
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return "Username can only contain letters and numbers";
  }

  try {
    const response = await getUserByUsername(value);

    if (returnResult) return response.data;

    if (response?.data?.length) {
      return "Username already taken";
    }

    return;
  } catch (error) {
    console.error(error);
    return "Something went wrong";
  }
};

export default authFormValidationSchemaWrapper;
