import { Router } from "express";
import checkJwt from "../middlewares/checkJwt";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  create,
  deleteById,
  getById,
  updateById,
} from "../controllers/chatrooms.controller";

const router = Router();

router
  .route("/:id")
  .get([checkJwt], asyncHandler(getById))
  .patch([checkJwt], asyncHandler(updateById))
  .delete([checkJwt], asyncHandler(deleteById));

router.get("/", [checkJwt], asyncHandler(getById));

router.post("/create", [checkJwt], asyncHandler(create));

export default router;
