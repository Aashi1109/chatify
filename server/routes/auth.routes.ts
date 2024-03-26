import { Router } from "express";
import { signupController } from "../controllers/auth.controller";

const router = Router();

router.get("/signup", signupController);

export default router;
