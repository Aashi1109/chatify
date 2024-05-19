import { login } from "@controllers/auth.controller";
import asyncHandler from "@middlewares/asyncHandler";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * tags:
 *  name: Auth
 * /login
 *  post:
 *      summary: Logins a user
 *      description: Returns access token, userid from provided username and password
 *      parameters:
 *          - in: path
 *            name: username
 *
 *
 *
 *
 */
router.post("/login", asyncHandler(login));

export default router;
