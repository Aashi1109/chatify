import { createUser, loginUser, uploadFile } from "@/actions/form";
import { EToastType, EUserRoles } from "@/definitions/enums";
import { IFileInterface } from "@/definitions/interfaces";
import authFormValidationSchemaWrapper, {
  validateUsername,
} from "@/schemas/authFormValidation";

import FileInput from "@/components/inputs/FileInput";
import ProfileImageInput from "@/components/inputs/ProfileImageInput";
import { showToaster } from "@/components/toasts/Toaster";
import { setAuth } from "@/features/authSlice";
import { useAppDispatch } from "@/hook";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingButton from "../ui/LoadingButton";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PasswordInput from "../inputs/PasswordInput";

const fileData: { profileImage: null | IFileInterface } = {
  profileImage: null,
};

const AuthForm: React.FC<{
  setFormValue?: (formData: object) => void;
  isLogin?: boolean;
}> = ({ setFormValue, isLogin }) => {
  const navigate = useNavigate();
  const dispatcher = useAppDispatch();
  const [searchParams] = useSearchParams();

  const [isLoginForm, setIsLoginForm] = useState(
    searchParams.get("type") === "login" ?? isLogin ?? true
  );

  const formInitialValues = {
    username: "",
    password: "",
    confirmPassword: "",
    about: "",
    name: "",
    rememberMe: false,
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
    reset,
  } = useForm({
    shouldUnregister: true,
    defaultValues: formInitialValues,
    resolver: yupResolver(authFormValidationSchemaWrapper),
    context: { isLoginForm },
  });

  const username = watch("username");

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

  async function handleFormSubmit(values: any) {
    try {
      const { username, about, confirmPassword, name, password, rememberMe } =
        values || {};
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

          dispatcher(
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
    }
  }

  useEffect(() => {
    const _func = async () => {
      if (!username) {
        return;
      }
      const result = await validateUsername(username);
      result && setError("username", { message: result });
    };

    // Add debounce to avoid too many API calls
    const timeoutId = setTimeout(() => {
      !isLoginForm && _func();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  return (
    <div className="rounded-xl p-8 bg-[--primary-hex] w-[95vw] sm:max-w-[500px]">
      <div className="flex flex-col items-center mb-8 gap-2">
        <p className="text-2xl">Welcome back</p>
        <p className="font-light">Please enter your details to continue.</p>
      </div>

      <form
        className="flex flex-col gap-6"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
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
              <input
                className={"input"}
                placeholder={"Enter full name"}
                {...register("name")}
              />
              {/* <ErrorMessage className="error-field" name="name" /> */}
              {errors.name ? (
                <div className="error-field">{errors.name.message}</div>
              ) : null}
            </div>
          )}
          {/* username field */}
          <div className="form-group">
            <input
              className={"input"}
              placeholder={"Enter username"}
              {...register("username")}
            />
            {errors.username ? (
              <div className="error-field">{errors.username.message}</div>
            ) : null}
          </div>
          {/* password field */}
          <PasswordInput
            register={register}
            errors={errors}
            showConfirmPassword={!isLoginForm}
            classes="gap-6"
          />

          {!isLoginForm && (
            <>
              {/* about field */}
              <div className="form-group">
                <textarea
                  className="input"
                  placeholder="Tell us about yourself ..."
                  rows={3}
                  style={{ resize: "none" }}
                  {...register("about")}
                />
                {/* <ErrorMessage className="error-field" name="about" /> */}
                {errors.about ? (
                  <div className="error-field">{errors.about.message}</div>
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
                id="remember-me"
                className="block w-4 h-4 custom__checkbox-input"
                {...register("rememberMe")}
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
              reset();
              clearErrors();
            }}
          >
            {isLoginForm ? "Sign up" : "Login"}
          </strong>
        </p>
      </form>
    </div>
  );
};

export default AuthForm;
