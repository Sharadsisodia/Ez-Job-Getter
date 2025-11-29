// src/App.js
// =============================
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import OtpVerify from "./pages/OtpPage";
import Dashboard from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import ResumePage from "./pages/ResumePage";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import NavBar from "./components/Navbar.js";
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OtpVerify />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumePage />
              </ProtectedRoute>
            }
          />

          {/* Add additional routes here */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;