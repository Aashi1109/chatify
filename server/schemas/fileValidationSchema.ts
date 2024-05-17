import * as Joi from "joi";
import { EUploadTypes } from "@definitions/enums";

const fileValidationSchema = Joi.object({
  preview: Joi.string().min(0).required(),
  format: Joi.string().min(0).optional(),
  name: Joi.string().min(0).optional(),
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Invalid groupId format",
    })
    .optional(),

  size: Joi.string().min(0).optional(),
  uploadTo: Joi.valid(...Object.values(EUploadTypes)).required(),
});

export default fileValidationSchema;
