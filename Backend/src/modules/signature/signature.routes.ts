//src/modules/signature/signature.routes.ts
import { Router } from "express";
import { acceptSigner, rejectSigner } from "./signature.controller";

const router = Router();

// Add logging to verify route is registered
console.log("🔧 Signature routes initialized");

// Route to accept signing
router.post("/:token/accept", (req, res, next) => {
  console.log("🎯 Route matched! Token:", req.params.token);
  next();
}, acceptSigner);

// Route to reject signing
router.post("/:token/reject", rejectSigner);

export default router;