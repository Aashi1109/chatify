import Joi from "joi";

export const createConversationValidationSchema = Joi.object({
  participants: Joi.array()
    .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
    .required()
    .min(2)
    .unique(),
  name: Joi.when("participants", {
    is: Joi.array().min(3),
    then: Joi.string().required(),
    otherwise: Joi.string().optional().allow(null, ""),
  }),
  description: Joi.string().optional().allow(null, ""),
  creatorId: Joi.when("participants", {
    is: Joi.array().min(3),
    then: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    otherwise: Joi.string().optional().allow(null),
  }),
  isPrivate: Joi.boolean().required(),
  image: Joi.object({
    url: Joi.string(),
    filename: Joi.string(),
    fileDataId: Joi.string(),
    publicId: Joi.string(),
  }).optional(),
}).custom((obj) => {
  obj.isGroup = obj.participants.length > 2;
  obj.isDirectMessage = obj.participants.length === 2;
  return obj;
});
