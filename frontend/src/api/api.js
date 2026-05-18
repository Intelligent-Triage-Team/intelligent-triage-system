import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000"
  // baseURL: "http://localhost:3000/api"
});

// ✅ ADD THIS BLOCK
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token; // no Bearer (your choice)
  }

  return config;
});

export default API;