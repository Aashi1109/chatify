import * as Joi from "joi";

const chatRoomValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
});

export default chatRoomValidationSchema;
