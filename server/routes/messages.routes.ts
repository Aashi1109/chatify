import {
  createMessage,
  deleteMessageById,
  getAllMessages,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
} from "@controllers/messages.controller";
import asyncHandler from "@middlewares/asyncHandler";
import {
  validateCreateMessage,
  validateMongooseIds,
  validateUpdateMessage,
} from "@middlewares/validators";
import { Router } from "express";

const router = Router();

router.get(
  "/query",
  [validateMongooseIds(["chatId", "userId", "groupId", "messageId"])],
  asyncHandler(getMessageByQuery)
);

router
  .route("")
  .get(asyncHandler(getAllMessages))
  .post([validateCreateMessage], asyncHandler(createMessage));

router
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

export default router;
