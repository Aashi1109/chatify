import {
  createMessage,
  deleteMessageById,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
} from "@controllers/messages.controller";
import asyncHandler from "@middlewares/asyncHandler";
import paginationParser from "@middlewares/paginationParser";
import {
  validateCreateMessage,
  validateMongooseIds,
  validateUpdateMessage,
} from "@middlewares/validators";
import { Router } from "express";

const router = Router();

router.get(
  "/query",
  [
    validateMongooseIds(["conversation", "user", "messageId"]),
    paginationParser,
  ],
  asyncHandler(getMessageByQuery)
);

router.route("").post([validateCreateMessage], asyncHandler(createMessage));

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
