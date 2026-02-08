export const createDocumentSchema = {
  title: {
    required: true,
    type: "string",
  },
  originalUrl: {
    required: true,
    type: "string",
  },
};

export const signDocumentSchema = {
  documentId: {
    required: true,
    type: "string",
  },
  signerEmail: {
    required: true,
    type: "string",
  },
  type: {
    required: true, // TYPED | DRAWN | IMAGE
    type: "string",
  },
  value: {
    required: true,
    type: "string",
  },
  x: {
    required: true,
    type: "number",
  },
  y: {
    required: true,
    type: "number",
  },
  page: {
    required: true,
    type: "number",
  },
};
