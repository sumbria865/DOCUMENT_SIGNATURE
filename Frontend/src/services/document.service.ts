import api from "./api";

export interface Document {
  id: string;
  ownerId: string;
  originalUrl: string;
  signedUrl: string | null;
  status: "PENDING" | "PARTIALLY_SIGNED" | "SIGNED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  signers?: Signer[];
}

export interface Signer {
  id: string;
  documentId: string;
  email: string;
  status: "PENDING" | "SIGNED" | "REJECTED";
  signedAt: string | null;
  rejectionReason?: string | null;
  token?: string;
}

export const documentService = {
  // ✅ Upload document
  async uploadDocument(
    file: File
  ): Promise<{ message: string; document: Document }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // ✅ Get logged-in user's documents
  async getMyDocuments(): Promise<{ message: string; documents: Document[] }> {
    const response = await api.get("/documents/my");
    return response.data;
  },

  // ✅ Get document by ID
  async getDocumentById(
    id: string
  ): Promise<{ message: string; document: Document }> {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // ✅ Sign document
  async signDocument(
    documentId: string,
    file: File,
    email: string
  ): Promise<{ message: string; document: Document }> {
    const formData = new FormData();
    formData.append("documentId", documentId);
    formData.append("file", file);
    formData.append("email", email);

    const response = await api.post("/documents/sign", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // ✅ Add signers
  async addSigners(documentId: string, emails: string[]): Promise<any> {
    const response = await api.post(`/documents/${documentId}/signers`, {
      emails,
    });
    return response.data;
  },

  // ===================================================================
  // 👤 OWNER ACTIONS (requires authentication)
  // ===================================================================

  // ✅ Owner accepts signer
  async acceptSigner(documentId: string, signerId: string): Promise<any> {
    const response = await api.patch(
      `/documents/${documentId}/signers/${signerId}/accept`
    );
    return response.data;
  },

  // ✅ Owner rejects signer
  async rejectSigner(
    documentId: string,
    signerId: string,
    reason: string
  ): Promise<any> {
    const response = await api.patch(
      `/documents/${documentId}/signers/${signerId}/reject`,
      { reason }
    );
    return response.data;
  },

  // ===================================================================
  // 🔗 EXTERNAL SIGNER ACTIONS (token-based, no authentication)
  // ===================================================================

  // ✅ External signer accepts via token
  async acceptSignerByToken(
    token: string,
    signatureData: {
      type: "DRAWN" | "TYPED" | "UPLOADED";
      value: string;
      x: number;
      y: number;
      page: number;
    }
  ): Promise<any> {
    const response = await api.post(`/sign/${token}/accept`, signatureData);
    return response.data;
  },

  // ✅ External signer rejects via token
  async rejectSignerByToken(token: string, reason: string): Promise<any> {
    const response = await api.post(`/sign/${token}/reject`, { reason });
    return response.data;
  },

  // ✅ Get document info by token (for external signers)
  async getDocumentByToken(token: string): Promise<any> {
    const response = await api.get(`/sign/${token}`);
    return response.data;
  },

  // ===================================================================
  // 📥 OTHER UTILITIES
  // ===================================================================

  // ✅ Download file as Blob
  async downloadFile(url: string): Promise<Blob> {
    const response = await api.get(url, {
      responseType: "blob",
    });

    return response.data;
  },
};