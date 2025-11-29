// =============================
// src/pages/LoginPage.js
// =============================
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
import EyePair from "../components/EyePair";

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [passFocused, setPassFocused] = useState(false);

  const isEyeClosed = passFocused || !!form.password;
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (error) {
      console.log('Login error:', error.response?.data);
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="signup-root">
      <div className="signup-card" style={{ display: 'flex', alignItems: 'stretch', maxWidth: 980 }}>
        <div className="signup-left" style={{ flex: 1 }}>
          <h2>Welcome back</h2>
          <p className="muted">Sign in to access your dashboard and smart job matches.</p>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className={`field ${form.email ? "filled" : ""}`}>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
                <span className="label">Email</span>
              </label>
            </div>
            <div className="field-group" style={{ position: "relative" }}>
              <label className={`field ${form.password ? "filled" : ""}`}>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <span className="label">Password</span>
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <button className="btn btn--ghost" type="button" onClick={() => navigate('/signup')}>Create account</button>
              <button className={`btn btn--primary`} type="submit">Sign in</button>
            </div>
          </form>
        </div>

        <div className="signup-right" style={{ width: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <EyePair cover={isEyeClosed} size={200} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
