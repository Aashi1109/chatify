import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { createUser, getUserById } from "../controllers/user.controller";
import { validateUser } from "../middlewares/validators";

const router = Router();

router.get("/:id", [], asyncHandler(getUserById));

router.post("/create", [validateUser], asyncHandler(createUser));

export default router;
