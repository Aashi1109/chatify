import { createUser, loginUser, uploadFile } from "@/actions/form";
import { EToastType, EUserRoles } from "@/definitions/enums";
import { IFileInterface } from "@/definitions/interfaces";
import { debounce } from "@/lib/helpers/generalHelper";
import authFormValidationSchemaWrapper, {
  validateUsername,
} from "@/schemas/authFormValidation";
import { Field, Form, Formik } from "formik";

import FileInput from "@/components/inputs/FileInput";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import { showToaster } from "@/components/toasts/Toaster";
import { setAuth } from "@/features/authSlice";
import { useAppDispatch } from "@/hook";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingButton from "../ui/LoadingButton";

const fileData: { profileImage: null | IFileInterface } = {
  profileImage: null,
};

const AuthForm: React.FC<{
  setFormValue?: (formData: object) => void;

  isLogin?: boolean;
}> = ({ setFormValue, isLogin }) => {
  const navigate = useNavigate();
  const dispatcher = useAppDispatch();

  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [isLoginForm, setIsLoginForm] = useState(isLogin ?? true);

  const togglePasswordVisibility = () => {
    setIsPasswordHidden((prevState) => !prevState);
  };

  const toggleLoginForm = () => {
    setIsLoginForm((prevState) => !prevState);
    fileData.profileImage = null;
  };

  const setFileData = (files: IFileInterface[]) => {
    if (files.length > 0) {
      fileData.profileImage = files[0];
    } else {
      fileData.profileImage = null;
    }
  };

  async function handleFormSubmit(
    setSubmitting: (isSubmitting: boolean) => void,
    values: {
      username: string;
      password: string;
      confirmPassword: string;
      about: string;
      name: string;
      rememberMe: boolean;
    },
    isLoginForm: boolean,
    dispatch: typeof dispatcher,
    setFormValue: ((formData: object) => void) | undefined
  ) {
    try {
      setSubmitting(true);
      const { username, about, confirmPassword, name, password, rememberMe } =
        values;
      let doLoginProcess = false;

      // if is login form then don't check for profile image
      if (!isLoginForm) {
        if (!fileData.profileImage) {
          // call popup function
          showToaster(EToastType.Error, "Profile image not provided");
        } else {
          const uploadFileResult = await uploadFile(fileData.profileImage);

          if (uploadFileResult?.data) {
            const profileImageData = {
              url: uploadFileResult.data?.fileMetadata?.secure_url ?? "",
              filename: fileData?.profileImage?.name ?? "",
              publicId: uploadFileResult.data?.fileMetadata?.public_id ?? "",
              fileDataId: uploadFileResult.data?._id?.toString() ?? "",
            };
            const createUserResponse = await createUser(
              username,
              name,
              password,
              confirmPassword,
              profileImageData,
              about,
              // TODO for now setting all user role as admin fix it later in later versions
              EUserRoles.Admin
            );

            // console.log(createUserResponse);
            if (createUserResponse?.data?._id) {
              // call popup function
              showToaster(EToastType.Success, "User created successfully");
              doLoginProcess = true;
            }
          } else {
            // call popup function
            showToaster(EToastType.Error, "Profile image not uploaded");

            setSubmitting(false);
          }
        }
      } else {
        doLoginProcess = true;
      }

      if (doLoginProcess) {
        // login the user with credentials
        const loginResult = await loginUser(
          values.username,
          values.password,
          rememberMe
        );
        // if response contains user then login successful
        // else show error message to user
        if (loginResult?.data?.user) {
          showToaster(EToastType.Success, "Login successful");

          dispatch(
            setAuth({
              isAuthenticated: true,
              user: loginResult.data.user,
            })
          );

          navigate("/");
        } else if (loginResult?.message) {
          showToaster(EToastType.Error, loginResult?.message);
        }
      }

      setFormValue &&
        setFormValue({ ...values, ...fileData, isLogin: isLoginForm });
    } catch (error: any) {
      showToaster(EToastType.Error, error?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const debouncedHandleFormSubmit = debounce(handleFormSubmit, 500);

  const formInitialValues = {
    username: "",
    password: "",
    confirmPassword: "",
    about: "",
    name: "",
    rememberMe: false,
  };

  return (
    <div className="rounded-xl p-8 bg-[--primary-hex] w-[95vw] sm:max-w-[500px]">
      <div className="flex flex-col items-center mb-8 gap-2">
        <p className="text-2xl">Welcome back</p>
        <p className="font-light">Please enter your details to continue.</p>
      </div>

      <Formik
        initialValues={formInitialValues}
        onSubmit={async (values, { setSubmitting }) => {
          await debouncedHandleFormSubmit(
            setSubmitting,
            values,
            isLoginForm,
            dispatcher,
            setFormValue
          );
        }}
        validationSchema={authFormValidationSchemaWrapper(isLoginForm)}
      >
        {({ isSubmitting, errors, setValues, touched, resetForm }) => (
          <Form className="flex flex-col gap-6">
            {!isLoginForm && (
              <div className="">
                <FileInput
                  acceptedFileTypes={["image/png", "image/jpeg", "image/*"]}
                  RenderComponent={ProfileImageInput}
                  setFiles={setFileData}
                />
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* name field */}
              {!isLoginForm && (
                <div className="form-group">
                  <Field
                    name={"name"}
                    className={"input"}
                    placeholder={"Enter full name"}
                  />
                  {/* <ErrorMessage className="error-field" name="name" /> */}
                  {errors.name && touched.name ? (
                    <div className="error-field">{errors.name}</div>
                  ) : null}
                </div>
              )}
              {/* username field */}
              <div className="form-group">
                <Field
                  name={"username"}
                  className={"input"}
                  placeholder={"Enter username"}
                  validate={validateUsername(isLoginForm)}
                />
                {/* <ErrorMessage className="error-field" name="username" /> */}
                {errors.username && touched.username ? (
                  <div className="error-field">{errors.username}</div>
                ) : null}
              </div>
              {/* password field */}
              <div className="form-group">
                <div className="relative">
                  <Field
                    type={isPasswordHidden ? "password" : "text"}
                    name="password"
                    className="input"
                    placeholder="Enter password"
                  />
                  <img
                    width={25}
                    height={25}
                    className="absolute p-1 hover:bg-gray-700 rounded-md right-2 top-[50%] translate-y-[-50%] cursor-pointer"
                    src={
                      isPasswordHidden
                        ? "/assets/password-hidden.png"
                        : "/assets/password-shown.png"
                    }
                    alt={isPasswordHidden ? "Show password" : "Hide password"}
                    onClick={togglePasswordVisibility}
                  />
                </div>
                {/* <ErrorMessage className="error-field" name="password" /> */}
                {errors.password && touched.password ? (
                  <div className="error-field">{errors.password}</div>
                ) : null}
              </div>

              {!isLoginForm && (
                <>
                  {/* confirmPassword field */}
                  <div className="form-group">
                    <Field
                      type={isPasswordHidden ? "password" : "text"}
                      name="confirmPassword"
                      className="input"
                      placeholder="Enter password again"
                    />
                    {/* <ErrorMessage
                      className="error-field"
                      name="confirmPassword"
                    /> */}
                    {errors.confirmPassword && touched.confirmPassword ? (
                      <div className="error-field">
                        {errors.confirmPassword}
                      </div>
                    ) : null}
                  </div>

                  {/* about field */}
                  <div className="form-group">
                    <Field
                      name="about"
                      as="textarea"
                      className="input"
                      placeholder="Tell us about yourself ..."
                      rows={3}
                      style={{ resize: "none" }}
                    />
                    {/* <ErrorMessage className="error-field" name="about" /> */}
                    {errors.about && touched.about ? (
                      <div className="error-field">{errors.about}</div>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {isLoginForm && (
              <div className="flex justify-between ">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="remember-me"
                    id="remember-me"
                    className="block w-4 h-4 custom__checkbox-input"
                    onChange={(e) => {
                      setValues((prevData) => ({
                        ...prevData,
                        rememberMe: e.target.checked,
                      }));
                    }}
                  />
                  <label
                    htmlFor="remember-me"
                    className="flex justify-center custom__checkbox-label"
                  >
                    <span className="custom__checkbox-button"></span>
                    Remember me
                  </label>
                </div>
                <a href={"/forgot-password"} className="underline">
                  Forgot password?
                </a>
              </div>
            )}

            <LoadingButton
              type="submit"
              disabled={isSubmitting}
              className={cn("button flex-center gap-2")}
              isLoading={isSubmitting}
            >
              {isLoginForm ? "Sign in" : "Sign up"}
            </LoadingButton>

            <p className="font-light text-center">
              {isLoginForm
                ? "Don't have an account yet? "
                : "Already have an account? "}
              <strong
                className="cursor-pointer underline"
                onClick={() => {
                  toggleLoginForm();
                  resetForm();
                }}
              >
                {isLoginForm ? "Sign up" : "Login"}
              </strong>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AuthForm;
