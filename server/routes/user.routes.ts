import { Router } from "express";

import {
  createUser,
  deleteById,
  getById,
  getByQuery,
  updateById,
  updatePasswordById,
} from "../controllers/user.controller";
import { EUserRoles } from "../definitions/enums";
import asyncHandler from "../middlewares/asyncHandler";
import checkJwt from "../middlewares/checkJwt";
import checkRoles from "../middlewares/checkRoles";
import { validateUser } from "../middlewares/validators";

const router = Router();

router.get("", asyncHandler(getByQuery));
router.get(
  "/:id",
  // [checkJwt, checkRoles([EUserRoles.User, EUserRoles.Admin])],
  asyncHandler(getById)
);

router.post("/create", [validateUser], asyncHandler(createUser));

router.patch("/:id/update", [checkJwt], asyncHandler(updateById));
router.patch(
  "/:id/updatePasswordById",
  [checkJwt],
  asyncHandler(updatePasswordById)
);

router.delete(
  "/:id/delete",
  [checkJwt, checkRoles([EUserRoles.User, EUserRoles.Admin])],
  asyncHandler(deleteById)
);

export default router;
