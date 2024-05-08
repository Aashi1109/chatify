import { Router } from "express";
import {
  createChat,
  deleteUserChatById,
  getByUserAndIteractingUserId,
  getChatsById,
  getChatsByQuery,
  updateChatById,
} from "../controllers/chats.controller";
import asyncHandler from "../middlewares/asyncHandler";

const router = Router();

router.get("", asyncHandler(getChatsByQuery));

router.post("/create", asyncHandler(createChat));

router
  .route("/:chatId")
  .delete(asyncHandler(deleteUserChatById))
  .patch(asyncHandler(updateChatById))
  .get(asyncHandler(getChatsById));

router.get(
  "/interaction/:userId/:receiverId",
  asyncHandler(getByUserAndIteractingUserId)
);

export default router;
