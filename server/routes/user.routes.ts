import { Router } from "express";

import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  getUserByQuery,
  updateUserById,
  updateUserPasswordById,
} from "@controllers/user.controller";
import asyncHandler from "@middlewares/asyncHandler";
import userParser from "@middlewares/userParser";
import { validateMongooseIds, validateUser } from "@middlewares/validators";

const router = Router();

router
  .route("")
  .get([validateMongooseIds(["not"])], asyncHandler(getAllUsers))
  .post([validateUser], asyncHandler(createUser));

router.get(
  "/query",
  [validateMongooseIds(["not", "userId"])],
  asyncHandler(getUserByQuery)
);

router
  .route("/:id")
  .get([validateMongooseIds(["id"]), userParser], asyncHandler(getUserById))
  .patch(
    [validateMongooseIds(["id"]), userParser],
    asyncHandler(updateUserById)
  )
  .delete(
    [validateMongooseIds(["id"]), userParser],
    asyncHandler(deleteUserById)
  );

router.patch(
  "/:id/updatePasswordById",
  [validateMongooseIds(["id"]), userParser],
  asyncHandler(updateUserPasswordById)
);

export default router;
