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
import { EUserRoles } from "@definitions/enums";
import asyncHandler from "@middlewares/asyncHandler";
import checkJwt from "@middlewares/checkJwt";
import checkRoles from "@middlewares/checkRoles";
import { validateMongooseIds, validateUser } from "@middlewares/validators";

const router = Router();

router.get(
  "/query",
  [validateMongooseIds(["not", "userId"])],
  asyncHandler(getUserByQuery)
);

router
  .route("/:id")
  .get(
    [validateMongooseIds(["id"])],
    // [checkJwt, checkRoles([EUserRoles.User, EUserRoles.Admin])],
    asyncHandler(getUserById)
  )
  .patch([validateMongooseIds(["id"]), checkJwt], asyncHandler(updateUserById))
  .delete(
    [
      validateMongooseIds(["id"]),
      checkJwt,
      checkRoles([EUserRoles.User, EUserRoles.Admin]),
    ],
    asyncHandler(deleteUserById)
  );

router
  .route("")
  .get(asyncHandler(getAllUsers))
  .post([validateUser], asyncHandler(createUser));

router.patch(
  "/:id/updatePasswordById",
  [validateMongooseIds(["id"]), checkJwt],
  asyncHandler(updateUserPasswordById)
);

export default router;
