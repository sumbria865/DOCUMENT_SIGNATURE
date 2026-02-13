import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://back-sign-5trk.onrender.com/api';

/* =========================
   TYPES
========================= */

export interface CompleteSigningPayload {
  token: string;
  type: "TYPED" | "DRAWN" | "IMAGE";

  // ✅ backend expects this key
  signatureImage: string;

  page: number;
  x: number;
  y: number;
}

/* =========================
   VERIFY SIGNER TOKEN (NEW)
========================= */
// ✅ Used to validate public signing link
// ✅ Called when /sign/:token page loads
export const verifySignerToken = async (token: string) => {
  const url = `${API_BASE_URL}/api/sign/${token}/verify`;

  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err: any) {
    console.error(
      "❌ Token verification failed:",
      err.response?.data || err.message
    );
    throw err;
  }
};

/* =========================
   COMPLETE SIGNING (UNCHANGED)
========================= */
export const completeSigning = async (data: CompleteSigningPayload) => {
  const url = `${API_BASE_URL}/api/sign/${data.token}/accept`;

  console.log("Calling API:", url, data);

  try {
    const res = await axios.post(url, {
      type: data.type,

      // ✅ IMPORTANT FIX (kept exactly as-is)
      signatureImage: data.signatureImage,

      page: data.page,
      x: data.x,
      y: data.y,
    });

    console.log("✅ API response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("❌ Axios error:", err.response?.data || err.message);
    throw err;
  }
};
