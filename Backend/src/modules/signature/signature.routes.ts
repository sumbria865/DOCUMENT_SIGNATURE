import { Router } from "express";
import { acceptSigner, rejectSigner } from "./signature.controller";
import { auditLog } from "../../middlewares/audit.middleware";

const router = Router();

console.log("🔧 Signature routes initialized");

router.post(
  "/:token/accept",
  auditLog("SIGN_LINK_OPENED"),
  acceptSigner
);

router.post(
  "/:token/reject",
  auditLog("SIGN_REJECTED"),
  rejectSigner
);

export default router;
