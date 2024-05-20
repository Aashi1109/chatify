import {
  createChat,
  deleteUserChatById,
  getByUserAndIteractingUserId,
  getChatsById,
  getChatsByQuery,
  updateChatById,
} from "@controllers/chats.controller";
import asyncHandler from "@middlewares/asyncHandler";
import { validateMongooseIds } from "@middlewares/validators";
import { Router } from "express";

const router = Router();

router.get(
  "/query",
  [validateMongooseIds(["chatId", "userId", "receiverId"])],
  asyncHandler(getChatsByQuery),
);

router.post("/create", asyncHandler(createChat));

router
  .route("/:chatId")
  .delete(validateMongooseIds(["chatId"]), asyncHandler(deleteUserChatById))
  .patch(validateMongooseIds(["chatId"]), asyncHandler(updateChatById))
  .get(validateMongooseIds(["chatId"]), asyncHandler(getChatsById));

router.get(
  "/interaction/:userId/:receiverId",
  [validateMongooseIds(["userId", "receiverId"])],
  asyncHandler(getByUserAndIteractingUserId),
);

export default router;
