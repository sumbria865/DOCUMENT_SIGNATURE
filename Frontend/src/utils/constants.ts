export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://doc-sig.onrender.com/';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  UPLOAD_DOCUMENT: '/documents/upload',
  MY_DOCUMENTS: '/documents',
  DOCUMENT_DETAILS: '/documents/:id',
  SIGN_DOCUMENT: '/sign/:token',
  SIGN_COMPLETE: '/sign-complete',
  AUDIT_LOGS: '/audit/:documentId',
} as const;

export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  PARTIALLY_SIGNED: 'PARTIALLY_SIGNED',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED',
} as const;

export const SIGNER_STATUS = {
  PENDING: 'PENDING',
  SIGNED: 'SIGNED',
  REJECTED: 'REJECTED',
} as const;

export const SIGNATURE_TYPE = {
  TYPED: 'TYPED',
  DRAWN: 'DRAWN',
  IMAGE: 'IMAGE',
} as const;

export const STATUS_COLORS = {
  PENDING: 'warning',
  PARTIALLY_SIGNED: 'primary',
  SIGNED: 'success',
  REJECTED: 'danger',
} as const;