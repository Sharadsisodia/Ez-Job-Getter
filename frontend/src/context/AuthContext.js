import React, { createContext, useContext, useEffect, useState } from "react";
import { loginAPI, getMeAPI, setAuthToken } from "../utils/api";
import { saveTokens } from "../utils/auth";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAuthToken(token); // attach token to axios
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getMeAPI();
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      // Token invalid → clear session
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    const res = await loginAPI({ email, password });

    const access = res.data.access;
    const refresh = res.data.refresh;
    const userData = res.data.user;  // backend must send {user: {...}}

    // save tokens globally
    saveTokens(access, refresh);
    setAuthToken(access);

    // update context + localStorage
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));

    return res;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        isLoggedIn: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
