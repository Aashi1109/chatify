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
import checkJwt from "@middlewares/checkJwt";
import { validateMongooseIds, validateUser } from "@middlewares/validators";

const router = Router();

router
  .route("")
  .get([validateMongooseIds(["not"])], asyncHandler(getAllUsers))
  .post([validateUser], asyncHandler(createUser));

router.get(
  "/query",
  [validateMongooseIds(["not", "userId"])],
  asyncHandler(getUserByQuery),
);

router
  .route("/:id")
  .get([validateMongooseIds(["id"]), checkJwt], asyncHandler(getUserById))
  .patch([validateMongooseIds(["id"]), checkJwt], asyncHandler(updateUserById))
  .delete(
    [validateMongooseIds(["id"]), checkJwt],
    asyncHandler(deleteUserById),
  );

router.patch(
  "/:id/updatePasswordById",
  [validateMongooseIds(["id"]), checkJwt],
  asyncHandler(updateUserPasswordById),
);

export default router;
