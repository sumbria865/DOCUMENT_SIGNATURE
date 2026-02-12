import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export const auditLog =
  (action: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documentIdCandidate =
        req.body?.documentId ??
        req.params?.documentId ??
        req.params?.id;

      // ✅ HARD TYPE GUARDS
      if (typeof documentIdCandidate === "string") {
        await prisma.auditLog.create({
          data: {
            documentId: documentIdCandidate,
            action,
            ipAddress: req.ip || "unknown", // ✅ FIX
            userAgent: req.headers["user-agent"] || "unknown",
          },
        });
      }
    } catch (error) {
      // ❗ Audit must NEVER break main flow
      console.error("⚠️ Audit log error:", error);
    }

    next();
  };
