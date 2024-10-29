import {
  createConversation,
  deleteConversationById,
  getConversationById,
  getConversationByQuery,
  updateConversationById,
} from "@controllers/conversation.controller";
import asyncHandler from "@middlewares/asyncHandler";
import paginationParser from "@middlewares/paginationParser";
import {
  validateConversation,
  validateMongooseIds,
} from "@middlewares/validators";
import { Router } from "express";

const router = Router();
const mongooseIdValidator = validateMongooseIds(["conversationId"]);

router.post("", validateConversation, asyncHandler(createConversation));

router.get(
  "/query",
  [mongooseIdValidator, paginationParser],
  asyncHandler(getConversationByQuery)
);

router
  .route("/:conversationId")
  .delete(mongooseIdValidator, asyncHandler(deleteConversationById))
  .patch(mongooseIdValidator, asyncHandler(updateConversationById))
  .get(mongooseIdValidator, asyncHandler(getConversationById));

export default router;
