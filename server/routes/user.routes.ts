import { Router } from "express";

import {
  createUser,
  deleteUserById,
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
  "/",
  [validateMongooseIds(["not", "userId"])],
  asyncHandler(getUserByQuery)
);
router.get(
  "/:id",
  [validateMongooseIds(["id"])],
  // [checkJwt, checkRoles([EUserRoles.User, EUserRoles.Admin])],
  asyncHandler(getUserById)
);

router.post("/create", [validateUser], asyncHandler(createUser));

router.patch(
  "/:id/update",
  [validateMongooseIds(["id"]), checkJwt],
  asyncHandler(updateUserById)
);
router.patch(
  "/:id/updatePasswordById",
  [validateMongooseIds(["id"]), checkJwt],
  asyncHandler(updateUserPasswordById)
);

router.delete(
  "/:id/delete",
  [
    validateMongooseIds(["id"]),
    checkJwt,
    checkRoles([EUserRoles.User, EUserRoles.Admin]),
  ],
  asyncHandler(deleteUserById)
);

export default router;
