import { Router } from "express";
import {
  createMessage,
  deleteMessageById,
  getAllMessages,
  getMessageById,
  getMessageByQuery,
  updateMessageById,
} from "../controllers/messages.controller";
import asyncHandler from "../middlewares/asyncHandler";
import checkJwt from "../middlewares/checkJwt";
import {
  validateCreateMessage,
  validateUpdateMessage,
} from "../middlewares/validators";

const router = Router();

router.get("", [checkJwt], asyncHandler(getMessageByQuery));
router.get("/all", [checkJwt], asyncHandler(getAllMessages));

router.patch(
  "/create",
  [checkJwt, validateCreateMessage],
  asyncHandler(createMessage)
);

router
  .route("/:messageId")
  .get([checkJwt], asyncHandler(getMessageById))
  .patch([checkJwt, validateUpdateMessage], asyncHandler(updateMessageById))
  .delete([checkJwt], asyncHandler(deleteMessageById));

export default router;
