// src/modules/document/document.controller.ts
import { Request, Response } from "express";
import { uploadDocument, getDocumentsByUser } from "./document.service";
import { sendSignedDocumentEmail } from "../../utils/email.service"; // create this file
import multer from "multer";

const upload = multer(); // for file buffers

/**
 * Upload a PDF document for the authenticated user
 */
export const createDocument = async (req: Request & { file?: Express.Multer.File, user?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const document = await uploadDocument(req.user.id, req.file.buffer);

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error: any) {
    console.error("Error uploading document:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Get all documents for the authenticated user
 */
export const getMyDocuments = async (req: Request & { user?: any }, res: Response) => {
  try {
    const documents = await getDocumentsByUser(req.user.id);

    res.status(200).json({
      message: "Documents fetched successfully",
      documents,
    });
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Receive signed document + save + send via email
 */
export const signDocument = async (req: Request & { file?: Express.Multer.File, user?: any }, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Signed document file is required" });
    }

    // Upload signed document
    const signedDoc = await uploadDocument(req.user.id, req.file.buffer);

    // Send email to recipient (pass recipient email in request body)
    if (!req.body.email) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    await sendSignedDocumentEmail(req.body.email, signedDoc.originalUrl);

    res.status(200).json({
      message: "Document signed and emailed successfully",
      signedDoc,
    });
  } catch (error: any) {
    console.error("Error signing document:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
