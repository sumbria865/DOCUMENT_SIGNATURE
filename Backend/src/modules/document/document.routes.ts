// src/modules/document/document.routes.ts
import { Router } from "express";
import { createDocument, getMyDocuments, signDocument } from "./document.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

// Get all documents for logged-in user
router.get("/my", authMiddleware, getMyDocuments);

// Upload a new PDF document
router.post("/", authMiddleware, upload.single("file"), createDocument);

// Upload signed document and send via email
router.post("/sign", authMiddleware, upload.single("file"), signDocument);

export default router;
