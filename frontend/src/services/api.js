/*
SERVICE: API (axios instance)
FILE: services/api.js
FUNGSI:
- Menyediakan instance axios terpusat dengan baseURL dan interceptor untuk Authorization
JIKA INGIN MENGUBAH:
- Ubah `VITE_API_URL` di env jika server backend berjalan di alamat berbeda
=================================
*/
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if (token) {

    req.headers.Authorization = `Bearer ${token}`;

  }

  return req;

});

export default API;