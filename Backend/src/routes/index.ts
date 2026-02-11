import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import documentRoutes from "../modules/document/document.routes";
import signerRoutes from "../modules/document/signer.routes";
import signatureRoutes from "../modules/signature/signature.routes";

const router = Router();

// ✅ Auth
router.use("/auth", authRoutes);

// ✅ Documents (Owner)
router.use("/documents", documentRoutes);

// ✅ External signer (token based)
router.use("/sign", signerRoutes);

// ✅ Signature routes (optional)
router.use("/signatures", signatureRoutes);

export default router;
