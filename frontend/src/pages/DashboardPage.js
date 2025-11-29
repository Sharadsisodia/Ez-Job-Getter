// =============================
// src/pages/DashboardPage.js
// =============================
import React, { useEffect, useState } from 'react';
import { getMeAPI } from '../utils/api';
import '../index.css';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeAPI().then((res) => { setUser(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h1 className="fade-in">Welcome, {user ? (user.name?.charAt(0).toUpperCase() + user.name?.slice(1)) : '—'}</h1>
            <p className="muted" style={{ marginTop: 6 }}>{user ? user.email : 'Loading profile...' }</p>
          </div>
          <div>
            <div className="badge">You have 3 saved jobs</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginTop: 18 }}>
          <div className="card" style={{ padding: 16 }}>
            <h4>Resume Score</h4>
            <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />
              <div>
                <h2 style={{ margin: 0 }}>83%</h2>
                <p className="muted">Optimized score for recent job suggestions</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <h4>Latest Matches</h4>
            <p className="muted" style={{ marginTop: 8 }}>AI matched 8 new roles for you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;