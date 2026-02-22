import express from "express";
import axios from "axios";
import multer from "multer";
import prisma from "../../config/db";
import cloudinary from "../../config/cloudinary";
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

// Serve original or signed PDF
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

// ✅ FIXED — generates a signed URL with correct version for Cloudinary files
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

    // Extract public_id and version from Cloudinary URL
    const urlParts = fileUrl.split("/upload/");
    const afterUpload = urlParts[1]; // e.g. "v1771772179/documents/file.pdf"

    const versionMatch = afterUpload.match(/^v(\d+)\//);
    const version = versionMatch ? parseInt(versionMatch[1]) : undefined;

    const publicId = afterUpload
      .replace(/^v\d+\//, "")   // remove version prefix
      .replace(/\.pdf$/, "");   // remove .pdf extension

    console.log("📄 public_id:", publicId);
    console.log("📄 version:", version);

    // ✅ Generate signed URL with correct version
    const signedUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      type: "upload",
      sign_url: true,
      version: version,          // ✅ pass exact version
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    console.log("📄 Fetching signed URL and proxying response:", signedUrl);

    // Proxy the Cloudinary signed URL through the backend to avoid CORS
    const upstream = await axios.get(signedUrl, { responseType: "stream" });

    // Forward content-type and content-length when available
    if (upstream.headers["content-type"]) {
      res.setHeader("Content-Type", upstream.headers["content-type"]);
    } else {
      res.setHeader("Content-Type", "application/pdf");
    }

    if (upstream.headers["content-length"]) {
      res.setHeader("Content-Length", upstream.headers["content-length"]);
    }

    // Stream the response to the client
    upstream.data.pipe(res);

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