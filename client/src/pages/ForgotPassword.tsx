import { forgotPassword } from "@/actions/form";
import PasswordInput from "@/components/inputs/PasswordInput";
import { showToaster } from "@/components/toasts/Toaster";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/LoadingButton";
import { EToastType } from "@/definitions/enums";
import { IUser } from "@/definitions/interfaces";
import { validateUsername } from "@/schemas/authFormValidation";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

enum EViews {
  UsernameSearch,
  NewPassword,
  Success,
}

const ForgotPassword = () => {
  const [view, setView] = useState<EViews>(EViews.UsernameSearch);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
    setValue,
    reset,
  } = useForm();
  const navigate = useNavigate();

  const username = watch("username");

  const onSubmit = async (data: any) => {
    const { password, confirmPassword } = data || {};
    try {
      const result = await forgotPassword(username, password, confirmPassword);
      if (result.success) {
        setView(EViews.Success);
        reset();
      }
    } catch (error: any) {
      console.log(error);
      showToaster(EToastType.Error, error.message);
    }
  };

  const isUsernameExists = async (username: string) => {
    setIsLoading(true);
    const result: string | IUser[] | undefined = await validateUsername(
      username,
      true
    );

    const isResultArray = Array.isArray(result);

    if (isResultArray && result.length > 0) {
      setView(EViews.NewPassword);
      clearErrors();
    } else if (result && typeof result === "string")
      setError("username", { message: result });
    else {
      setError("username", { message: "User with this username not found" });
    }
    setIsLoading(false);
  };

  const isUsernameView = view === EViews.UsernameSearch;
  const isResetDoneView = view === EViews.Success;

  const _handleSubmit = (e: any) => {
    e?.preventDefault();

    if (isResetDoneView) {
      return navigate("/auth?type=login");
    }

    if (isUsernameView) isUsernameExists(username);
    else {
      handleSubmit(onSubmit)(e);
    }
  };

  const buttonText = {
    [EViews.UsernameSearch]: "Proceed",
    [EViews.NewPassword]: "Reset Password",
    [EViews.Success]: "Go to Login",
  };

  const descriptionText = {
    [EViews.UsernameSearch]: "Enter your username to reset your password",
    [EViews.NewPassword]:
      "Password must contain at least 1 letter, 1 number and 1 symbol. Minimum length is 8 characters",
    [EViews.Success]: "Your password has been reset successfully.",
  };

  const titleText = {
    [EViews.UsernameSearch]: "Reset Password",
    [EViews.NewPassword]: "Change Password",
    [EViews.Success]: "Reset Done",
  };

  const renderContent = () => {
    switch (view) {
      case EViews.UsernameSearch:
        return (
          <div className="form-group">
            <Input
              placeholder="Enter your username"
              onChange={(e) => {
                clearErrors("username");
                setValue("username", e.target.value);
              }}
            />
            {errors.username && (
              <div className="error-field">
                {errors.username.message?.toString()}
              </div>
            )}
          </div>
        );
      case EViews.NewPassword:
        return (
          <PasswordInput
            register={register}
            errors={errors}
            placeholder="New Password"
            showPasswordStrength={true}
          />
        );
      case EViews.Success:
        return (
          <div className="flex-center mb-4">
            <img
              src={"/assets/green-check.png"}
              alt="green check"
              className="w-20 h-20 object-contain text-center"
            />
          </div>
        );
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        {view === EViews.NewPassword && (
          <ChevronLeft
            className="w-8 h-8 hover:-translate-x-1 transition duration-300 cursor-pointer mb-4"
            onClick={() => {
              reset();
              setView(EViews.UsernameSearch);
            }}
          />
        )}
        <CardTitle>{titleText[view]}</CardTitle>
        <CardDescription>{descriptionText[view]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={_handleSubmit}>
          {renderContent()}

          <LoadingButton
            onClick={_handleSubmit}
            isLoading={isLoading}
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {buttonText[view]}
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPassword;
