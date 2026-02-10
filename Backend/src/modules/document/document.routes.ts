import { Router } from "express";
import {
  createDocument,
  getMyDocuments,
  signDocument,
  getDocumentById,
  addSigners,
} from "./document.controller";

import { protect } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

// ✅ Get all documents for logged-in user
router.get("/my", protect, getMyDocuments);

// ✅ Get single document (View Details)
router.get("/:id", protect, getDocumentById);

// ✅ Upload a new PDF document
router.post("/", protect, upload.single("file"), createDocument);

// ✅ Upload signed document
router.post("/sign", protect, upload.single("file"), signDocument);

// ✅ Add signers to a document
router.post("/:documentId/signers", protect, addSigners);

export default router;
