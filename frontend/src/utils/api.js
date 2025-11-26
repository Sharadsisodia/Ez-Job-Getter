// src/utils/api.js

import axios from 'axios';
import { API_BASE_URL } from './config';
import { getAccessToken } from './auth';

export const api = axios.create({
  baseURL: API_BASE_URL, // MUST end with "/"
});

// Attach token
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const signupAPI = (data) => api.post('/accounts/signup/', data);
export const verifyOtpAPI = (data) => api.post('/accounts/verify_otp/', data);
export const resendOtpAPI = (data) => api.post('/accounts/resend_otp/', data);
export const loginAPI = (data) => api.post('/accounts/login/', data);
export const getMeAPI = () => api.get('/accounts/me/');
