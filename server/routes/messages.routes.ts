import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import {
  createMessage,
  deleteMessage,
  getAll,
  getById,
  updateMessage,
} from "../controllers/messages.controller";
import checkJwt from "../middlewares/checkJwt";

const router = Router();

router.get("/:roomId", [checkJwt], asyncHandler(getAll));
router.get("/:roomId/:messageId", [checkJwt], asyncHandler(getById));

router.post("/:roomId/create", [checkJwt], asyncHandler(createMessage));

router.patch(
  "/:roomId/:messageId/update",
  [checkJwt],
  asyncHandler(updateMessage)
);

router.delete(
  "/:roomId/:messageId/delete",
  [checkJwt],
  asyncHandler(deleteMessage)
);

export default router;
