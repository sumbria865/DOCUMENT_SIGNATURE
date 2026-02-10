import { Router } from "express";
import { protect } from "../../middlewares/auth.middleware";
import { 
  acceptSigner, 
  rejectSigner,
  ownerAcceptSigner,
  ownerRejectSigner
} from "./signer.controller";
import prisma from "../../config/db"; // ✅ Add this import

const router = Router();

// ✅ Owner manually accepts/rejects signers (requires auth)
router.patch("/:documentId/signers/:signerId/accept", protect, ownerAcceptSigner);
router.patch("/:documentId/signers/:signerId/reject", protect, ownerRejectSigner);

// ✅ External signer accepts/rejects via token (NO auth needed)
router.post("/:token/accept", acceptSigner);
router.post("/:token/reject", rejectSigner);

// ✅ TEST ROUTE - Get all pending signer tokens
router.get("/test-tokens", async (req, res) => {
  try {
    const signers = await prisma.signer.findMany({
      where: { status: "PENDING" as any },
      select: { 
        email: true, 
        token: true, 
        documentId: true 
      },
      take: 20,
      orderBy: { signedAt: 'desc' }
    });
    
    const urls = signers.map(s => ({
      email: s.email,
      documentId: s.documentId,
      signingUrl: `http://localhost:3000/sign/${s.token}`,
      token: s.token
    }));
    
    res.json({ count: urls.length, signers: urls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

console.log("✅ signer.routes.ts loaded");

export default router;