// =============================
// src/pages/HomePage.js
// =============================
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

function HomePage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ padding: '48px', position: 'relative' }}>
      <div className="blob blob--1" />
      <div className="blob blob--2" />
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 640 }}>
            <h1 style={{ fontSize: 38, marginBottom: 8 }}>AI-powered Job & Resume Analyzer</h1>
            <p style={{ color: '#dbeafe', marginBottom: 18, fontSize: 18 }}>Smart matching, resume improvements and interview tips — all powered by AI. Enjoy a delightful experience while building your career.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {!isLoggedIn ? (
                <>
                  <Link to="/signup"><button className="btn btn--primary">Get Started</button></Link>
                  <Link to="/login"><button className="btn btn--ghost">Sign in</button></Link>
                </>
              ) : (
                <>
                  <button className="btn btn--primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </>
              )}
            </div>
          </div>
          <div style={{ padding: 24 }}>
            <div className="card" style={{ width: 260, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="badge">🚀 Early access</div>
                  <h3 style={{ margin: '10px 0 4px', color: '#fff' }}>Try the Smart Match</h3>
                </div>
              </div>
              <p className="muted" style={{ margin: 0 }}>Upload your resume and we'll show matched jobs instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HomePage;