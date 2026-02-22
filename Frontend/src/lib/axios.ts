import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL 
    || 'https://backend-deployed-k6st.onrender.com/api',
  withCredentials: true,
});

export default api;
