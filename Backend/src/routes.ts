import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import documentRoutes from "./modules/document/document.routes";
import signerRoutes from "./modules/document/signer.routes";

const router = Router();

router.use("/auth", authRoutes);

// ✅ Owner actions (authenticated): /api/documents/:documentId/signers/:signerId/accept
router.use("/documents", signerRoutes);
router.use("/documents", documentRoutes);

// ✅ External signer actions (token-based): /api/sign/:token/accept
router.use("/sign", signerRoutes);

export default router;