import express from "express";
import multer from "multer";
import prisma from "../../config/db";
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

// Upload document + audit
router.post(
  "/",
  protect,
  upload.single("file"),
  auditLog("DOCUMENT_CREATED"),
  createDocument
);

router.get("/my", protect, getMyDocuments);

// Serve original or signed PDF — redirect to Cloudinary public URL
router.get("/:id/file", protect, async (req, res): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    const fileUrl = doc.signedUrl || doc.originalUrl;

    if (!fileUrl) {
      res.status(404).json({ message: "File URL not found" });
      return;
    }

    res.redirect(fileUrl);
  } catch (err: any) {
    console.error("File route error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ FIXED — redirect to Cloudinary URL directly
router.get("/:id/signed-file", protect, async (req, res): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) {
      res.status(404).json({ message: "Document not found" });
      return;
    }

    const fileUrl = doc.signedUrl || doc.originalUrl;

    console.log("📄 originalUrl:", doc.originalUrl);
    console.log("📄 signedUrl:", doc.signedUrl);
    console.log("📄 Using fileUrl:", fileUrl);

    if (!fileUrl) {
      res.status(404).json({ message: "File URL not found" });
      return;
    }

    // ✅ Redirect directly to Cloudinary — no proxy fetch needed
    res.redirect(fileUrl);

  } catch (err: any) {
    console.error("Proxy file error:", err);
    res.status(500).json({ message: err.message });
  }
});

// These come AFTER the specific routes above
router.get("/:id", protect, getDocumentById);
router.post("/:documentId/sign", protect, upload.single("file"), signDocument);
router.post("/:documentId/signers", protect, addSigners);

export default router;