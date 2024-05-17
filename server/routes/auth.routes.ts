import { login } from "@controllers/auth.controller";
import asyncHandler from "@middlewares/asyncHandler";
import { Router } from "express";

const router = Router();

router.post("/login", asyncHandler(login));

export default router;
