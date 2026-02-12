import express from "express";
import multer from "multer";
import {
  createDocument,
  getMyDocuments,
  getDocumentById,
  signDocument,
  addSigners,
} from "./document.controller";
import { protect } from "../../middlewares/auth.middleware";
import { auditLog } from "../../middlewares/audit.middleware";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// ✅ Upload document + audit
router.post(
  "/",
  protect,
  upload.single("file"),
  auditLog("DOCUMENT_CREATED"),
  createDocument
);

router.get("/my", protect, getMyDocuments);
router.get("/:id", protect, getDocumentById);
router.post("/:documentId/sign", protect, upload.single("file"), signDocument);
router.post("/:documentId/signers", protect, addSigners);

export default router;
