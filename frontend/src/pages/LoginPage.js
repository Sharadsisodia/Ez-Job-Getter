// =============================
// src/pages/LoginPage.js
// =============================
import React, { useState } from 'react';
import { loginAPI } from '../utils/api';
import { saveTokens } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginAPI(form);
      console.log("Login Success:", res.data);
      saveTokens(res.data.access, res.data.refresh);
      navigate('/dashboard');
    } catch (error) {
      console.log("Error:", error.response?.data);
      alert(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        /><br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        /><br /><br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
