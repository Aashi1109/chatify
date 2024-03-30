import * as Joi from "joi";

const messageValidationSchema = Joi.object({
  content: Joi.string().required(),
  roomId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(), // Assuming ObjectId is represented as a hexadecimal string of length 24
  senderId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(), // Assuming ObjectId is represented as a hexadecimal string of length 24
  isEdited: Joi.boolean().default(false),
});

export default messageValidationSchema;
