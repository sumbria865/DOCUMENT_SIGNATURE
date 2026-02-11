import { Router } from "express";
import {
  acceptSigner,
  rejectSigner,
  ownerAcceptSigner,
  ownerRejectSigner,
} from "./signer.controller";

import prisma from "../../config/db";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

/**
 * ✅ EXTERNAL SIGNER ROUTES (PUBLIC - NO AUTH)
 * Mounted at: /api/sign
 */
router.post("/:token/accept", acceptSigner);
router.post("/:token/reject", rejectSigner);

/**
 * ✅ OWNER ROUTES (DASHBOARD - AUTH REQUIRED)
 * Mounted at: /api/sign
 */
router.post(
  "/:documentId/signers/:signerId/accept",
  protect,
  ownerAcceptSigner
);

router.post(
  "/:documentId/signers/:signerId/reject",
  protect,
  ownerRejectSigner
);

/**
 * ✅ TEST ROUTE - Get pending signer tokens
 */
router.get("/test-tokens", async (req, res) => {
  try {
    const signers = await prisma.signer.findMany({
      where: { status: "PENDING" as any },
      select: {
        email: true,
        token: true,
        documentId: true,
      },
      take: 20,
      orderBy: { signedAt: "desc" },
    });

    const urls = signers.map((s) => ({
      email: s.email,
      documentId: s.documentId,
      signingUrl: `http://localhost:3000/sign/${s.token}`,
      token: s.token,
    }));

    res.json({ count: urls.length, signers: urls });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

console.log("✅ signer.routes.ts loaded");

export default router;
