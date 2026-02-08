// src/routes/index.ts
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import documentRoutes from "../modules/document/document.routes";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Document routes
router.use("/documents", documentRoutes);

export default router;
