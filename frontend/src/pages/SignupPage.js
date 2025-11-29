// =============================
// src/pages/SignupPage.js
// =============================
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { signupAPI } from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';
import EyePair from "../components/EyePair";

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'candidate' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleHighlighted, setRoleHighlighted] = useState(0);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  const roleRef = useRef(null);
  const navigate = useNavigate();
  const roleOptions = [
    { value: 'candidate', label: 'Candidate' },
    { value: 'recruiter', label: 'Recruiter' },
  ];

  // Utility: label for selected
  const roleLabel = roleOptions.find(o => o.value === form.role)?.label || 'Role';

  const validate = (values) => {
    const err = {};
    if (!values.name.trim()) err.name = 'Name is required';
    if (!values.email.trim()) err.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) err.email = 'Enter a valid email';
    if (!values.password) err.password = 'Password is required';
    else if (values.password.length < 8) err.password = 'Password should be 8+ characters';
    if (values.confirmPassword !== values.password) err.confirmPassword = 'Passwords do not match';
    if (!['candidate', 'recruiter'].includes(values.role)) err.role = 'Select a role';
    return err;
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarPreview(null);
      setAvatarFile(null);
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const passwordStrength = useMemo(() => {
    const p = form.password || '';
    let score = 0;
    if (p.length > 7) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(4, score);
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setLoading(true);
    try {
      // Build payload
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      };

      // Optional: attach avatar as base64 if selected (backend must support)
      if (avatarFile && avatarPreview) {
        payload.avatar = avatarPreview; // base64 string
      }

      await signupAPI(payload);
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      // Show error message returned by API if available
      const message = err?.response?.data?.message || 'Signup failed. Please try again';
      setErrors(prev => ({ ...prev, api: message }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const onClick = (e) => {
      if (!roleRef.current?.contains(e.target)) {
        setRoleOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setRoleOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggleRoleOpen = () => {
    setRoleOpen(v => !v);
    if (!roleOpen) {
      // highlight currently selected item
      const currentIndex = roleOptions.findIndex(o => o.value === form.role);
      setRoleHighlighted(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  const selectRole = (value) => {
    setForm(prev => ({ ...prev, role: value }));
    setErrors(prev => ({ ...prev, role: '' }));
    setRoleOpen(false);
  };

  const onRoleKeyDown = (e) => {
    if (!roleOpen && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleRoleOpen();
      return;
    }
    if (!roleOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setRoleHighlighted(i => Math.min(i + 1, roleOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setRoleHighlighted(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = roleOptions[roleHighlighted];
      if (opt) selectRole(opt.value);
    } else if (e.key === 'Escape') {
      setRoleOpen(false);
    }
  };

  const isEyeClosed = passFocused || confirmPassFocused || !!form.password || !!form.confirmPassword;

  return (
    <div className="signup-root">
      <div className="signup-card" style={{ display: 'flex', alignItems: 'stretch' }}>
        <div className="signup-left" style={{ flex: 1 }}>
          <h2>Join Job Match</h2>
          <p className="muted">Create an account to discover jobs matched to your profile — powered by AI.</p>

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="field-group">
              <label className={`field ${form.name ? 'filled' : ''}`}>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  aria-label="Name"
                />
                <span className="label">Full Name</span>
              </label>
              <div className="error">{errors.name}</div>
            </div>

            <div className="field-group">
              <label className={`field ${form.email ? 'filled' : ''}`}>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  aria-label="Email"
                />
                <span className="label">Email address</span>
              </label>
              <div className="error">{errors.email}</div>
            </div>

            <div className="field-row">
              <div className="field-group" style={{ flex: 1, marginRight: 12, position: "relative" }}>
                <label className={`field ${form.password ? "filled" : ""}`}>
                  <input
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    aria-label="Password"
                    autoComplete="new-password"
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                  />
                  <span className="label">Password</span>
                </label>
                <div className="pw-actions">
                  <button type="button" className="link small" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <div className="strength">
                    <div className={`bar ${passwordStrength >= 1 ? 'on' : ''}`}></div>
                    <div className={`bar ${passwordStrength >= 2 ? 'on' : ''}`}></div>
                    <div className={`bar ${passwordStrength >= 3 ? 'on' : ''}`}></div>
                    <div className={`bar ${passwordStrength >= 4 ? 'on' : ''}`}></div>
                  </div>
                </div>
                <div className="error">{errors.password}</div>
              </div>

              <div className="field-group" style={{ flex: 1, position: "relative" }}>
                <label className={`field ${form.confirmPassword ? "filled" : ""}`}>
                  <input
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    aria-label="Confirm Password"
                    autoComplete="new-password"
                    onFocus={() => setConfirmPassFocused(true)}
                    onBlur={() => setConfirmPassFocused(false)}
                  />
                  <span className="label">Confirm Password</span>
                </label>
                <div className="error">{errors.confirmPassword}</div>
              </div>
            </div>

            <div className="field-row">
              <div className="field-group" style={{ flex: 1 }}>
                {/* Role custom dropdown */}
                <label className={`field custom-select ${form.role ? 'filled' : ''}`} ref={roleRef}>
                  <div
                    className="custom-select__control"
                    role="button"
                    aria-haspopup="listbox"
                    aria-expanded={roleOpen}
                    tabIndex={0}
                    onClick={toggleRoleOpen}
                    onKeyDown={onRoleKeyDown}
                  >
                    <span className="custom-select__value">{roleLabel}</span>
                    <span className={`custom-select__arrow ${roleOpen ? 'open' : ''}`} aria-hidden>
                      {/* small chevron */}
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>

                  <ul
                    className={`custom-select__list ${roleOpen ? 'open' : ''}`}
                    role="listbox"
                    aria-activedescendant={`role-option-${roleHighlighted}`}
                    tabIndex={-1}
                  >
                    {roleOptions.map((opt, idx) => (
                      <li
                        id={`role-option-${idx}`}
                        key={opt.value}
                        role="option"
                        aria-selected={form.role === opt.value}
                        tabIndex={0}
                        className={`custom-select__item ${roleHighlighted === idx ? 'highlighted' : ''} ${form.role === opt.value ? 'selected' : ''}`}
                        onClick={() => selectRole(opt.value)}
                        onMouseEnter={() => setRoleHighlighted(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectRole(opt.value);
                          }
                        }}
                      >
                        {opt.label}
                        {form.role === opt.value && <span className="custom-select__check" aria-hidden>✓</span>}
                      </li>
                    ))}
                  </ul>

                  <span className="label">Role</span>
                </label>

                <div className="error">{errors.role}</div>
              </div>

              <div className="field-group" style={{ flex: 1 }}>
                <div className="avatar-uploader">
                  <label className={`file-label ${avatarPreview ? 'has-preview' : ''}`}>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar preview" aria-hidden="true" />
                    ) : (
                      <span className="file-placeholder">Upload Avatar</span>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {errors.api && <div className="error api">{errors.api}</div>}

            <div className="actions">
              <button className={`btn primary ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create account'}
              </button>
              <div className="alt">
                <span>Already have an account?</span>
                <Link to="/login" className="link">Sign in</Link>
              </div>
            </div>
          </form>
        </div>

        {/* signup-right column (new placement for big eye) */}
        <div className="signup-right" style={{ width: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <EyePair cover={isEyeClosed} size={220} className="signup-right-eye" />
          {/* Existing decorative/illustration content can remain here as needed. */}
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
