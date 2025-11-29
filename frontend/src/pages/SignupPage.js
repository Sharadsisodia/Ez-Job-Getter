// =============================
// src/pages/SignupPage.js
// =============================
import React, { useState } from 'react';
import { signupAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send role also
      await signupAPI(form);

      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      console.log(err.response?.data);
      alert('Signup Failed');
    }
  };

  return (
    <div style={{ padding: '40px' }}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        /><br /><br />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        /><br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        /><br /><br />

        {/* Optional dropdown (remove if not needed) */}
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="candidate">Candidate</option>
          <option value="recruiter">Recruiter</option>
        </select>
        <br /><br />

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignupPage;
