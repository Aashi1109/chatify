import * as Joi from "joi";
import { UserRoles } from "../definitions/enums";

const userValidationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .messages({
      "any.only": "Confirm password must match the password",
    })
    .required(),
  profileImage: Joi.string().uri().optional().allow(""),
  about: Joi.string().optional().allow(""),
  role: Joi.string().valid(...Object.values(UserRoles)),
});

export default userValidationSchema;
