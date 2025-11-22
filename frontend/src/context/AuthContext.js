import { createContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check token on first load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch logged-in user
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/accounts/me/");
      setUser(res.data);
    } catch (err) {
      localStorage.removeItem("accessToken");
    }
    setLoading(false);
  };

  // Signup
  const signup = async (data) => {
    return await api.post("/api/accounts/signup/", data);
  };

  // Verify OTP
  const verifyOtp = async (data) => {
    return await api.post("/api/accounts/verify_otp/", data);
  };

  // Login
  const login = async (email, password) => {
    const res = await api.post("/api/accounts/login/", { email, password });
    localStorage.setItem("accessToken", res.data.access);
    setUser(res.data.user);
    return res;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        verifyOtp,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
