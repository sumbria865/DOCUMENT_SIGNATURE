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

const router = express.Router();

// ✅ Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"));
  },
});

// ✅ Correct routes (NO extra /documents here)

// Upload document
router.post("/", protect, upload.single("file"), createDocument);

// Get all documents of logged-in user
router.get("/my", protect, getMyDocuments);

// Get single document
router.get("/:id", protect, getDocumentById);

// Upload signed pdf (optional)
router.post("/:documentId/sign", protect, upload.single("file"), signDocument);

// Add signers
router.post("/:documentId/signers", protect, addSigners);

export default router;
