// =============================
// src/components/Navbar.js
// =============================
import React from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';


function Navbar() {
const navigate = useNavigate();


const handleLogout = () => {
logout();
navigate('/login');
};


return (
<nav style={{ padding: '15px', background: '#222', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
<h2>AI Powered Job Portal</h2>
<div>
<Link to="/" style={{ color: '#fff', marginRight: '20px' }}>Home</Link>


{!isLoggedIn() && (
<>
<Link to="/signup" style={{ color: '#fff', marginRight: '20px' }}>Signup</Link>
<Link to="/login" style={{ color: '#fff' }}>Login</Link>
</>
)}


{isLoggedIn() && (
<>
<Link to="/dashboard" style={{ color: '#fff', marginRight: '20px' }}>Dashboard</Link>
<button onClick={handleLogout} style={{ background: 'red', color: 'white', padding: '6px 12px', border: 'none', cursor: 'pointer' }}>Logout</button>
</>
)}
</div>
</nav>
);
}


export default Navbar;