import { login, logOut, session } from "@controllers/auth.controller";
import asyncHandler from "@middlewares/asyncHandler";
import userParser from "@middlewares/userParser";
import { Router } from "express";

const router = Router();

router.post("/login", asyncHandler(login));
router.post("/logout", asyncHandler(logOut));
router.get("/session", [userParser], asyncHandler(session));

export default router;
