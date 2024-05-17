import {
  createGroup,
  deleteGroup,
  getGroupById,
  getGroupsByQuery,
  updateGroup,
} from "@controllers/groups.controller";
import asyncHandler from "@middlewares/asyncHandler";
import { validateMongooseIds } from "@middlewares/validators";
import { Router } from "express";

const router = Router();

router.get(
  "/query",
  [validateMongooseIds(["groupId", "userId", "creatorId"])],
  asyncHandler(getGroupsByQuery)
);
router.post("/create", asyncHandler(createGroup));
router
  .route("/:groupId")
  .get([validateMongooseIds(["groupId"])], asyncHandler(getGroupById))
  .patch([validateMongooseIds(["groupId"])], asyncHandler(updateGroup))
  .delete([validateMongooseIds(["groupId"])], asyncHandler(deleteGroup));

export default router;
