// =============================
// src/pages/HomePage.js
// =============================
import React from 'react';
import { Link } from 'react-router-dom';


function HomePage() {
return (
<div style={{ padding: '40px', textAlign: 'center' }}>
<h1>Welcome to AI Powered Job & Resume Analyzer</h1>
<p>Your smart assistant for job matching & resume improvement</p>


<Link to="/signup">
<button style={{ padding: '12px 25px', background: 'blue', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '20px' }}>
Get Started
</button>
</Link>
</div>
);
}
export default HomePage;