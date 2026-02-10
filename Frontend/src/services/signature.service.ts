import api from "./api";

export const verifySigner = async (token: string) => {
  const { data } = await api.get(`/signatures/verify/${token}`);
  return data;
};

export const completeSigning = async (payload: {
  token: string;
  type: "TYPED" | "DRAWN" | "IMAGE";
  signatureImage: string;
  x: number;
  y: number;
  page: number;
}) => {
  return api.post("/signatures/complete", payload);
};
