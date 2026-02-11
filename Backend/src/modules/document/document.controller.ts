// src/modules/document/document.controller.ts
import { Request, Response } from "express";

import {
  uploadDocument,
  getDocumentsByUser,
  getDocumentByIdService,
  uploadSignedDocumentService,
  addSignersService,
} from "./document.service";

import { sendSignedDocumentEmail } from "../../utils/email.service";

/**
 * Upload a PDF document for the authenticated user
 */
export const createDocument = async (
  req: Request & { file?: Express.Multer.File; user?: any },
  res: Response
) => {
  try {
    // ✅ DEBUG LOGGING
    console.log("=== UPLOAD REQUEST DEBUG ===");
    console.log("req.file exists?", !!req.file);
    console.log("req.file:", req.file);
    console.log("File details:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      bufferLength: req.file.buffer?.length,
      bufferExists: !!req.file.buffer
    } : 'NO FILE');
    console.log("req.body:", req.body);
    console.log("req.headers['content-type']:", req.headers['content-type']);
    console.log("========================");

    // ✅ CHECK 1: File exists
    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({ message: "PDF file is required" });
    }

    // ✅ CHECK 2: Buffer exists and not empty
    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error("❌ Empty buffer detected!", {
        bufferExists: !!req.file.buffer,
        bufferLength: req.file.buffer?.length
      });
      return res.status(400).json({ message: "Uploaded file is empty" });
    }

    // ✅ CHECK 3: Valid PDF mimetype
    if (req.file.mimetype !== 'application/pdf') {
      console.error("❌ Invalid file type:", req.file.mimetype);
      return res.status(400).json({ 
        message: "Only PDF files are allowed",
        received: req.file.mimetype 
      });
    }

    console.log("✅ All validations passed, uploading document...");

    const document = await uploadDocument(req.user.id, req.file.buffer);

    console.log("✅ Document uploaded successfully:", document.id);

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error: any) {
    console.error("❌ Error uploading document:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Get all documents for the authenticated user
 */
export const getMyDocuments = async (
  req: Request & { user?: any },
  res: Response
) => {
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
 * Get single document by ID (View Details)
 */
export const getDocumentById = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    let { id } = req.params as any;

    // Fix: id can be string | string[]
    if (Array.isArray(id)) {
      id = id[0];
    }

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid document id" });
    }

    const document = await getDocumentByIdService(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Security: only owner can view
    if (document.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      message: "Document fetched successfully",
      document,
    });
  } catch (error: any) {
    console.error("Error fetching document:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Upload signed document + update + send email
 */
export const signDocument = async (
  req: Request & { file?: Express.Multer.File; user?: any },
  res: Response
) => {
  try {
    let { documentId, email } = req.body;

    // Fix TypeScript: documentId could be string | string[]
    if (Array.isArray(documentId)) {
      documentId = documentId[0];
    }

    if (Array.isArray(email)) {
      email = email[0];
    }

    if (!documentId || typeof documentId !== "string") {
      return res.status(400).json({ message: "documentId is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Signed document file is required" });
    }

    // ✅ CHECK: Buffer exists and not empty
    if (!req.file.buffer || req.file.buffer.length === 0) {
      return res.status(400).json({ message: "Uploaded signed document is empty" });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    const document = await getDocumentByIdService(documentId);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedDoc = await uploadSignedDocumentService(
      documentId,
      req.file.buffer
    );

    await sendSignedDocumentEmail(email, updatedDoc.signedUrl!);

    res.status(200).json({
      message: "Document signed and emailed successfully",
      document: updatedDoc,
    });
  } catch (error: any) {
    console.error("Error signing document:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Add signers to a document
 */
export const addSigners = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    // ✅ DEBUG LOGGING
    console.log("=== ADD SIGNERS REQUEST ===");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    console.log("Body type:", typeof req.body);
    console.log("Emails:", req.body.emails);
    console.log("Emails type:", typeof req.body.emails);
    console.log("Emails is array?", Array.isArray(req.body.emails));
    console.log("========================");

    let { documentId } = req.params as any;
    const { emails } = req.body;

    // Fix: documentId can be string | string[]
    if (Array.isArray(documentId)) {
      documentId = documentId[0];
    }

    if (!documentId || typeof documentId !== "string") {
      console.error("Invalid documentId:", documentId);
      return res.status(400).json({ message: "Invalid document ID" });
    }

    // Validate emails
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      console.error("Invalid emails:", emails);
      return res.status(400).json({ 
        message: "Please provide an array of emails" 
      });
    }

    console.log("Processing emails:", emails);

    // Call service
    const createdSigners = await addSignersService(
      documentId,
      emails,
      req.user.id
    );

    console.log("Signers created successfully:", createdSigners.length);

    res.status(200).json({
      message: "Signers added successfully",
      signers: createdSigners,
      count: createdSigners.length,
    });
  } catch (error: any) {
    console.error("Error adding signers:", error);
    
    // Handle specific error messages
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.message.includes("permission")) {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message.includes("Invalid email") || error.message.includes("already signers")) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ 
      message: error.message || "Internal Server Error" 
    });
  }
};