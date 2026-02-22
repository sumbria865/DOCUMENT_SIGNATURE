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

// ✅ FIXED Proxy route — directly fetches public Cloudinary PDF and streams it
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

    // ✅ Directly fetch the public Cloudinary URL — no signing needed
    const response = await fetch(fileUrl);

    console.log("📄 Cloudinary fetch status:", response.status);

    if (!response.ok) {
      console.error("❌ Cloudinary fetch failed:", response.status, response.statusText);
      res.status(500).json({
        message: "Failed to fetch file from Cloudinary",
        cloudinaryStatus: response.status,
      });
      return;
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.setHeader("Cache-Control", "no-store");

    res.send(Buffer.from(buffer));
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