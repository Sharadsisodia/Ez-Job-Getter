// =============================
// src/pages/DashboardPage.js
// =============================
import React, { useEffect, useState } from 'react';
import { getMeAPI } from '../utils/api';


function DashboardPage() {
const [user, setUser] = useState(null);


useEffect(() => {
getMeAPI().then((res) => setUser(res.data));
}, []);


return (
<div style={{ padding: '40px' }}>
<h1>Dashboard</h1>
{user ? (
<>
<h3>Welcome, {user.name.charAt(0).toUpperCase() + user.name.slice(1)}</h3>
<p>Email: {user.email}</p>
</>
) : (
<p>Loading...</p>
)}
</div>
);
}


export default DashboardPage;