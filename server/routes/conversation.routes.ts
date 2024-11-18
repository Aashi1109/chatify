import {
  createConversation,
  deleteConversationById,
  getConversationById,
  getConversationByQuery,
  updateConversationById,
} from "@controllers/conversation.controller";
import {
  createMessage,
  deleteMessageById,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
} from "@controllers/messages.controller";
import { ICustomRequest } from "@definitions/interfaces";
import { NotFoundError } from "@exceptions";
import asyncHandler from "@middlewares/asyncHandler";
import paginationParser from "@middlewares/paginationParser";
import {
  validateConversation,
  validateCreateMessage,
  validateMongooseIds,
  validateUpdateMessage,
} from "@middlewares/validators";
import { Conversation } from "@models";
import { RedisCommonCache } from "@redis";
import { NextFunction, Router, Request, Response } from "express";

const conversationCache = new RedisCommonCache();
const userStatusCache = new RedisCommonCache("sct");


const conversationParser = async (
  req: ICustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let conversation = await conversationCache.methods.getKey(
      `conversation:${req.params.conversationId}`
    );

    if (!conversation) {
      conversation = await Conversation.findById(req.params.conversationId);
      conversation &&
        conversationCache.methods.setString(
          `conversation:${req.params.conversationId}`,
          conversation.toObject(),
          3600
        );
    }
    if (!conversation) throw new NotFoundError("Conversation not found");
    req.conversation = conversation;

    next();
  } catch (error) {
    next(error);
  }
};

const conversationRouter = Router();
const messageRouter = Router({ mergeParams: true });

conversationRouter.post(
  "/",
  validateConversation,
  asyncHandler(createConversation)
);
conversationRouter.post(
  "/query",
  [paginationParser],
  asyncHandler(getConversationByQuery)
);
conversationRouter
  .route("/:conversationId")
  .all(validateMongooseIds(["conversationId"]))
  .get(asyncHandler(getConversationById))
  .patch(asyncHandler(updateConversationById))
  .delete(asyncHandler(deleteConversationById));

// this parser will set conversation data for each message request
messageRouter.use(asyncHandler(conversationParser));
messageRouter.get(
  "/query",
  [paginationParser],
  asyncHandler(getMessageByQuery)
);
messageRouter.post("/", [validateCreateMessage], asyncHandler(createMessage));
messageRouter
  .route("/:messageId")
  .get([validateMongooseIds(["messageId"])], asyncHandler(getMessageById))
  .patch(
    [validateMongooseIds(["messageId"]), validateUpdateMessage],
    asyncHandler(updateMessageById)
  )
  .delete(
    [validateMongooseIds(["messageId"])],
    asyncHandler(deleteMessageById)
  );

conversationRouter.use(
  "/:conversationId/messages",
  validateMongooseIds(["conversationId"]),
  messageRouter
);

export default conversationRouter;
