// =============================
// src/pages/OtpPage.js
// =============================
import React, { useState } from 'react';
import { verifyOtpAPI, resendOtpAPI } from '../utils/api';
import { useLocation, useNavigate } from 'react-router-dom';


function OtpPage() {
const location = useLocation();
const navigate = useNavigate();


const email = location.state?.email || '';
const [otp, setOtp] = useState('');


const handleVerify = async () => {
try {
await verifyOtpAPI({ email, otp });
navigate('/login');
} catch (err) {
alert('Invalid OTP');
}
};


const handleResend = async () => {
await resendOtpAPI({ email });
alert('OTP Resent');
};


return (
<div style={{ padding: '40px' }}>
<h2>Verify OTP</h2>
<p>Email: {email}</p>


<input placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} /><br /><br />


<button onClick={handleVerify}>Verify</button>
<button onClick={handleResend} style={{ marginLeft: '10px' }}>Resend OTP</button>
</div>
);
}
export default OtpPage;