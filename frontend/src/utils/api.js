// src/utils/api.js

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  // Set to true if using Django session auth (cookies). If you use JWT only, you can set false.
  withCredentials: true,
});

// attach CSRF token if any (optional)
function getCookie(name) {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return match ? decodeURIComponent(match.pop()) : '';
}
api.interceptors.request.use((config) => {
  try {
    const csrf = getCookie('csrftoken');
    if (csrf) config.headers['X-CSRFToken'] = csrf;
  } catch {}
  return config;
});

// debugging
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.debug('[API request]', config.method?.toUpperCase(), config.url, config.data);
  }
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API error]', error.config?.url, error.response?.status, error.response?.data);
    }
    return Promise.reject(error);
  }
);

// This function updates axios defaults and localStorage using 'accessToken' key
export function setAuthToken(token) {
  if (token) {
    const header = `Bearer ${token}`;
    api.defaults.headers.common['Authorization'] = header;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
}

// initialize axios default header from the stored 'accessToken'
const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// =============================
// JOBS API
// =============================

// 1) Get all jobs OR create job (if employer)
export const jobsAPI = {
  list: () => api.get("/api/jobs/"),
  create: (payload) => api.post("/api/jobs/", payload),
};

// 2) Search external (scraper-based) jobs
export const searchJobsAPI = ({
  role = "",
  location = "",
  pages = 1,
  sources = "",
}) =>
  api.get(
    `/api/jobs/search/?role=${role}&location=${location}&pages=${pages}&sources=${sources}`
  );

// 3) Employer job list + create
export const employerJobsAPI = {
  list: () => api.get("/api/jobs/employer_jobs/"),
  create: (payload) => api.post("/api/jobs/employer_jobs/", payload),
};

// 4) Employer Job detail (GET, PUT, DELETE)
export const employerJobDetailAPI = {
  get: (id) => api.get(`/api/jobs/${id}/employer_job_detail/`),
  update: (id, payload) =>
    api.put(`/api/jobs/${id}/employer_job_detail/`, payload),
  delete: (id) => api.delete(`/api/jobs/${id}/employer_job_detail/`),
};



// Basic endpoints used by the frontend
export const loginAPI = (payload) => api.post('/api/accounts/login/', payload);
export const signupAPI = (payload) => api.post('/api/accounts/signup/', payload);
export const verifyOtpAPI = (payload) => api.post('/api/accounts/verify_otp/', payload);
export const resendOtpAPI = (payload) => api.post('/api/accounts/resend_otp/', payload);
export const getMeAPI = () => api.get('/api/accounts/me/');

export default api;
