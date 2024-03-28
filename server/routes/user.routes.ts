import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  create,
  deleteById,
  getById,
  getByUsername,
  updateById,
  updatePassword,
} from "../controllers/user.controller";
import { validateUser } from "../middlewares/validators";

const router = Router();

router.get("/:id", [], asyncHandler(getById));
router.get("/:username", [], asyncHandler(getByUsername));

router.post("/create", [validateUser], asyncHandler(create));

router.patch("/:id/update", [], asyncHandler(updateById));
router.patch("/:id/updatePassword", [], asyncHandler(updatePassword));

router.delete("/:id/delete", [], asyncHandler(deleteById));

export default router;
