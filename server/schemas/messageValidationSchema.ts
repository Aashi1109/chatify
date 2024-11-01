import * as Joi from "joi";
import { EMessageCategory, EMessageType } from "@definitions/enums";

const messageCreateValidationSchema = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid userId format",
      "any.required": "userId is required",
    }),
  chat: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid chatId format",
      "any.required": "chatId is required",
    }),
  content: Joi.string().required().messages({
    "any.required": "Content is required",
  }),
  sentAt: Joi.date().required().messages({
    "any.required": "SentAt is required",
    "date.base": "SentAt must be a valid date",
  }),
  type: Joi.string()
    .valid(...Object.values(EMessageType))
    .default(EMessageType.Text)
    .messages({
      "any.only": "Invalid message type",
      "any.default": "Type defaulted to 'text'",
    }),
  category: Joi.string()
    .valid(...Object.values(EMessageCategory))
    .default(EMessageCategory.User)
    .messages({
      "any.only": "Invalid category type",
      "any.default": "Category defaulted to 'user'",
    }),
});

const messageUpdateValidationSchema = Joi.object({
  content: Joi.string().required().messages({
    "any.required": "Content is required",
  }),
  seenAt: Joi.date().optional().messages({
    "date.base": "SeenAt must be a valid date",
  }),
  deliveredAt: Joi.date().optional().messages({
    "date.base": "DeliveredAt must be a valid date",
  }),
});

export { messageCreateValidationSchema, messageUpdateValidationSchema };
