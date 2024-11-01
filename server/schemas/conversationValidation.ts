import { EConversationTypes } from "@definitions/enums";
import Joi from "joi";

const allowedTypesForCreation = [
  EConversationTypes.PRIVATE,
  EConversationTypes.GROUP,
];
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
  creator: Joi.when("participants", {
    is: Joi.array().min(3),
    then: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .custom((value, helpers) => {
        const participants = (helpers.state.ancestors[0] as any).participants;
        if (!participants.includes(value)) {
          return helpers.message({
            custom: "Creator must be one of the participants",
          });
        }
        return value;
      }),
    otherwise: Joi.string().optional().allow(null),
  }),
  image: Joi.object({
    url: Joi.string().uri({ scheme: ["http", "https"] }),
    filename: Joi.string(),
    fileDataId: Joi.string(),
    publicId: Joi.string(),
  })
    .optional()
    .allow(null),
  type: Joi.string()
    .valid(...allowedTypesForCreation)
    .required(),
})
  .prefs({ stripUnknown: true })
  .external((value) => {
    const isDirectMessage = value.type === EConversationTypes.PRIVATE;
    return {
      ...value,
      creator: isDirectMessage ? null : value.creator,
      name: isDirectMessage ? null : value.name,
      description: isDirectMessage ? null : value.description,
      image: isDirectMessage ? null : value.image,
    };
  });
