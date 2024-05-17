import {
  createMessage,
  deleteMessageById,
  getAllMessages,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
} from "@controllers/messages.controller";
import asyncHandler from "@middlewares/asyncHandler";
import checkJwt from "@middlewares/checkJwt";
import {
  validateCreateMessage,
  validateMongooseIds,
  validateUpdateMessage,
} from "@middlewares/validators";
import { Router } from "express";

const router = Router();

router.get(
  "/query",
  [validateMongooseIds(["chatId", "userId", "groupId", "messageId"]), checkJwt],
  asyncHandler(getMessageByQuery)
);
router.get("", [checkJwt], asyncHandler(getAllMessages));

router.patch(
  "/create",
  [checkJwt, validateCreateMessage],
  asyncHandler(createMessage)
);

router
  .route("/:messageId")
  .get(
    [validateMongooseIds(["messageId"]), checkJwt],
    asyncHandler(getMessageById)
  )
  .patch(
    [validateMongooseIds(["messageId"]), checkJwt, validateUpdateMessage],
    asyncHandler(updateMessageById)
  )
  .delete(
    [validateMongooseIds(["messageId"]), checkJwt],
    asyncHandler(deleteMessageById)
  );

export default router;
