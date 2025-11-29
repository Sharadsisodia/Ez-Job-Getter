// =============================
// src/pages/OtpPage.js
// =============================
import React, { useState } from 'react';
import { verifyOtpAPI, resendOtpAPI } from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';
import './SignupPage.css';
import EyePair from "../components/EyePair";

function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEyeClosed = otpFocused || !!otp;

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOtpAPI({ email, otp });
      navigate('/login');
    } catch (err) {
      alert('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await resendOtpAPI({ email });
    alert('OTP Resent');
  };

  return (
    <div className="signup-root">
      <div className="signup-card card fade-in" style={{ padding: 26, maxWidth: 720, display: 'flex', alignItems: 'stretch' }}>
        <div className="signup-left" style={{ flex: 1 }}>
          <h2>Verify OTP</h2>
          <p className="muted">Code was sent to: <strong style={{ color: '#fff' }}>{email}</strong></p>
          <div style={{ marginTop: 18 }}>
            <div className="field-group" style={{ position: "relative" }}>
              <label className={`field ${otp ? 'filled' : ''}`}>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} onFocus={() => setOtpFocused(true)} onBlur={() => setOtpFocused(false)} />
                <span className="label">Enter OTP</span>
              </label>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn--ghost" onClick={() => navigate('/')}>Cancel</button>
              <button className="btn btn--primary" onClick={handleVerify}>{loading ? 'Verifying...' : 'Verify'}</button>
              <button className="btn btn--ghost" onClick={handleResend}>Resend OTP</button>
            </div>
          </div>
        </div>

        <div className="signup-right" style={{ width: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <EyePair cover={isEyeClosed} size={180} />
        </div>
      </div>
    </div>
  );
}

export default OtpPage;