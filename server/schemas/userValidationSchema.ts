import * as Joi from "joi";

const userValidationSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  profileImage: Joi.string().uri().required(),
  about: Joi.string().optional(),
});

export default userValidationSchema;
