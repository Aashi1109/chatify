import { checkUsernameExists } from "@/actions/form";
import * as Yup from "yup";

const authFormValidationSchemaWrapper = (isLoginForm: boolean) => {
  const schema = Yup.object().shape({
    // username: Yup.string()
    //   .matches(
    //     /^[a-zA-Z0-9]+$/,
    //     "Username can only contain letters and numbers"
    //   )
    //   .min(3, "Username must be at least 3 characters")
    //   .max(20, "Username must be at most 20 characters")
    //   .required("Username is required.")
    //   .when({
    //     is: (username: string | undefined) => !isLoginForm && username,
    //     then: (schema: any) =>
    //       Yup.string()
    //         .matches(
    //           /^[a-zA-Z0-9]+$/,
    //           "Username can only contain letters and numbers"
    //         )
    //         .min(3, "Username must be at least 3 characters")
    //         .max(20, "Username must be at most 20 characters")
    //         .test(
    //           "checkUsername",
    //           "Username already taken.",
    //           async function (value: string | undefined, { createError }) {
    //             if (!value)
    //               return createError({ message: "Username is required" });
    //             try {
    //               const response = await fetch(`your-api-endpoint/${value}`);
    //               const data = await response.json();
    //               return createError({ message: "" }); // Return true if the username is available, false otherwise
    //             } catch (error) {
    //               console.error("Error:", error);
    //               return createError({ message: "Something went wrong" }); // Return false in case of error
    //             }
    //           }
    //         ),
    //     // otherwise: () => Yup.string().required("Username is "),
    //   }),
    password: Yup.string()
      .min(8, "Password should be 8 characters long.")
      .required("Password is required."),
    confirmPassword: Yup.string().when({
      is: () => !isLoginForm,
      then: (schema: any) =>
        Yup.string().oneOf(
          [Yup.ref("password")],
          "Password and Confirm Password must be the same"
        ),
      otherwise: (schema: any) => Yup.string().nullable(),
    }),
    name: Yup.string().when({
      is: () => !isLoginForm,
      then: (schema: any) =>
        Yup.string()
          .min(3, "Full name should be min 3 chars.")
          .required("Full name is required"),
      otherwise: (schema: any) => Yup.string().nullable(),
    }),
    about: Yup.string().optional().min(5, "More than 5 characters required."),
  });

  return schema;
};

export const validateUsername =
  (isLoginForm: boolean) => async (value: string | undefined) => {
    if (!value) {
      return "Username is required";
    }
    if (value.length > 20 || value.length < 3) {
      return "Username must be between 3 and 20 characters long";
    }
    if (!/^[a-zA-Z0-9]+$/.test(value)) {
      return "Username can only contain letters and numbers";
    }

    // validate username
    if (isLoginForm) {
      return; // No error
    }

    try {
      const isUsernameExists = await checkUsernameExists(value); // Assuming checkUsernameExists is an async function
      console.log("isUsernameExists", isUsernameExists);

      if (isUsernameExists) {
        return "Username already taken";
      }

      return; // No error
    } catch (error) {
      console.error(error);
      return "Something went wrong";
    }
  };

export default authFormValidationSchemaWrapper;
