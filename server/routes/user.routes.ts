import { Router } from "express";

import {
  createUser,
  deleteUserById,
  forgotPasswordHandler,
  getAllUsers,
  getUserById,
  getUserByQuery,
  updateUserById,
  updateUserPasswordById,
} from "@controllers/user.controller";
import asyncHandler from "@middlewares/asyncHandler";
import userParser from "@middlewares/userParser";
import { validateMongooseIds, validateUser } from "@middlewares/validators";
import paginationParser from "@middlewares/paginationParser";

const router = Router();

router.patch("/forgot-password", asyncHandler(forgotPasswordHandler));

router
  .route("")
  .get([validateMongooseIds(["not"])], asyncHandler(getAllUsers))
  .post([validateUser], asyncHandler(createUser));

router.get(
  "/query",
  [validateMongooseIds(["not", "userId"]), paginationParser],
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
  "/:id/update-password",
  [validateMongooseIds(["id"])],
  asyncHandler(updateUserPasswordById)
);

export default router;
