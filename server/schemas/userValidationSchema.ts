import * as Joi from "joi";
import { EUserRoles } from "../definitions/enums";

const userValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.alphanum": "Username must only contain alphanumeric characters",
    "string.min": "Username must be at least {#limit} characters long",
    "string.max": "Username must not exceed {#limit} characters",
    "any.required": "Username is required",
  }),
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name must be at least {#limit} characters long",
    "string.max": "Name must not exceed {#limit} characters",
    "any.required": "Name is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least {#limit} characters long",
    "any.required": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match the password",
    "any.required": "Confirm password is required",
  }),
  profileImage: Joi.object({
    url: Joi.string().uri().allow("").messages({
      "string.uri": "Profile image must be a valid URI",
    }),
    filename: Joi.string().allow("").messages({
      "string.uri": "Filename must be a valid",
    }),
    publicId: Joi.string().optional().allow("").messages({
      "string.uri": "Public ID must be a valid",
    }),
    fileDataId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow("")
      .messages({
        "string.pattern.base": "Invalid fileDataId format",
      }),
  })
    .required()
    .messages({
      "any.required": "Profile image data is required.",
    }),
  about: Joi.string().optional().allow("").messages({
    "string.base": "About must be a string",
  }),
  role: Joi.string()
    .valid(...Object.values(EUserRoles))
    .messages({
      "any.only": "Invalid user role",
    }),
});

export default userValidationSchema;
