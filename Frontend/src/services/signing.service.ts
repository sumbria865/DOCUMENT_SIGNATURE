import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // backend URL

export interface CompleteSigningPayload {
  token: string;
  type: "TYPED" | "DRAWN" | "IMAGE";
  value: string; // use 'value' instead of signatureImage
  page: number;
  x: number;
  y: number;
}

export const completeSigning = async (data: CompleteSigningPayload) => {
  const url = `${API_BASE_URL}/api/sign/${data.token}/accept`; // correct URL
  console.log("Calling API:", url, data);

  try {
    const res = await axios.post(url, {
      type: data.type,
      value: data.value, // send 'value'
      page: data.page,
      x: data.x,
      y: data.y,
    });
    console.log("API response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Axios error:", err.response || err);
    throw err;
  }
};
