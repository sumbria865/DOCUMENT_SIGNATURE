import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import documentRoutes from "../modules/document/document.routes";
import signerRoutes from "../modules/document/signer.routes";  // ✅ Import
import signatureRoutes from "../modules/signature/signature.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/documents", signerRoutes);  // ✅ THIS LINE IS CRITICAL
router.use("/sign", signatureRoutes);

export default router;