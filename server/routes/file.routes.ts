import { Router } from "express";
import {
  deleteFileDataById,
  getAllFileData,
  getCloudinaryFileByPublicId,
  getFileDataById,
  uploadFile,
} from "@controllers/fileupload.controller";
import asyncHandler from "@middlewares/asyncHandler";
import checkJwt from "@middlewares/checkJwt";
import { validateFileUploadData } from "@middlewares/validators";

const router = Router();

router.get("query", [checkJwt], asyncHandler(getAllFileData));

router.post("/upload", [validateFileUploadData], asyncHandler(uploadFile));
router.post(
  "/cloudinary/:id",
  [checkJwt],
  asyncHandler(getCloudinaryFileByPublicId)
);

router
  .route("/:id")
  .get([checkJwt], asyncHandler(getFileDataById))
  .delete([checkJwt], asyncHandler(deleteFileDataById));

export default router;
