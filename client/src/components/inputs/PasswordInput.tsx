import { cn } from "@/lib/utils";
import { useState } from "react";
import { FieldErrors } from "react-hook-form";
import { UseFormRegister } from "react-hook-form";
import { Input } from "../ui/input";

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  classes?: string;
  placeholder?: string;
  showConfirmPassword?: boolean;
  showPasswordStrength?: boolean;
  useYupValidation?: boolean;
  name?: string;
}

const PasswordInput = ({
  register,
  errors,
  classes,
  placeholder,
  showConfirmPassword = true,
  showPasswordStrength = false,
  useYupValidation = false,
  name = "password",
}: Props) => {
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
    textColor: "",
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let message = "";
    let color = "";
    let textColor = "";

    // Basic length check
    if (password.length >= 8) score++;

    // Check for uppercase letters and numbers
    if (/[A-Z]/.test(password) && /\d/.test(password)) score++;

    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    // Set message and color based on score
    switch (score) {
      case 0:
        message = "Weak";
        color = "bg-red-500";
        textColor = "text-red-500";
        break;
      case 1:
        message = "Medium";
        color = "bg-yellow-500";
        textColor = "text-yellow-500";
        break;
      case 2:
        message = "Strong";
        color = "bg-blue-500";
        textColor = "text-blue-500";
        break;
      case 3:
        message = "Very Strong";
        color = "bg-green-500";
        textColor = "text-green-500";
        break;
      default:
        message = "";
        color = "";
        textColor = "";
    }

    setPasswordStrength({ score, message, color, textColor });
  };

  const getPasswordValidation = () => {
    if (useYupValidation) {
      return {
        onChange: (e: any) =>
          showPasswordStrength && checkPasswordStrength(e.target.value),
      };
    }

    return {
      required: "Password is required",
      minLength: {
        value: 8,
        message: "Password must be at least 8 characters long",
      },
      pattern: {
        value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
        message:
          "Password must contain at least one uppercase letter, one number, and one special character",
      },
      onChange: (e: any) =>
        showPasswordStrength && checkPasswordStrength(e.target.value),
    };
  };

  const getConfirmPasswordValidation = () => {
    if (useYupValidation) {
      return {};
    }

    return {
      required: "Please confirm your password",
      validate: (value: string, formValues: any) =>
        value === formValues?.[name] || "Passwords do not match",
    };
  };

  return (
    <div className={cn("flex flex-col gap-4", classes)}>
      <div className="form-group">
        <div className="relative">
          <Input
            type={isPasswordHidden ? "password" : "text"}
            className="input"
            placeholder={placeholder || "Enter password"}
            {...register(name, getPasswordValidation())}
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
            onClick={() => setIsPasswordHidden(!isPasswordHidden)}
          />
        </div>
        {errors?.[name] && (
          <div className="error-field">
            {errors?.[name].message?.toString()}
          </div>
        )}
      </div>

      {showConfirmPassword && (
        <div className="form-group">
          <Input
            type={isPasswordHidden ? "password" : "text"}
            className="input"
            placeholder="Enter password again"
            {...register("confirmPassword", getConfirmPasswordValidation())}
          />
          {errors.confirmPassword && (
            <div className="error-field">
              {errors.confirmPassword.message?.toString()}
            </div>
          )}
        </div>
      )}

      {/* Password Strength Meter */}
      {showPasswordStrength && passwordStrength.message && (
        <div className="mt-2">
          <div className="flex gap-1 h-2 mb-1">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 h-full rounded-full transition-all duration-300",
                  index <= passwordStrength.score
                    ? passwordStrength.color
                    : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <p className={cn("text-xs text-right", passwordStrength.textColor)}>
            {passwordStrength.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
