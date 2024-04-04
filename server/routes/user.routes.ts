import { Router } from "express";

import asyncHandler from "../middlewares/asyncHandler";
import {
  create,
  deleteById,
  getById,
  getByUsername,
  updateById,
  updatePasswordById,
} from "../controllers/user.controller";
import { validateUser } from "../middlewares/validators";
import checkJwt from "../middlewares/checkJwt";
import checkRoles from "../middlewares/checkRoles";
import { EUserRoles } from "../definitions/enums";

const router = Router();

router.get(
  "/:id",
  [checkJwt, checkRoles([EUserRoles.User, EUserRoles.Admin])],
  asyncHandler(getById)
);
router.get(
  "/",
  [checkJwt, checkRoles([UserRoles.User, UserRoles.Admin])],
  asyncHandler(getByUsername)
);

router.post("/create", [validateUser], asyncHandler(create));

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
