import { Router } from "express";
import {
  deleteFileDataById,
  getAllFileData,
  getCloudinaryFileByPublicId,
  getFileDataById,
  uploadFile,
} from "@controllers/fileupload.controller";
import asyncHandler from "@middlewares/asyncHandler";
import userParser from "@middlewares/userParser";
import { validateFileUploadData } from "@middlewares/validators";

const router = Router();

router.get("query", [userParser], asyncHandler(getAllFileData));

router.post("/upload", [validateFileUploadData], asyncHandler(uploadFile));
router.post(
  "/cloudinary/:id",
  [userParser],
  asyncHandler(getCloudinaryFileByPublicId)
);

router
  .route("/:id")
  .get([userParser], asyncHandler(getFileDataById))
  .delete([userParser], asyncHandler(deleteFileDataById));

export default router;
