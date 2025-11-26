// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import OtpVerify from "./pages/OtpVerify";
// import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import { AuthProvider } from "./context/AuthContext";

// function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>

//           <Route path="/signup" element={<Signup />} />
//           <Route path="/verify-otp" element={<OtpVerify />} />
//           <Route path="/login" element={<Login />} />

//           {/* Protected Route */}
//           <Route
//             path="/dashboard"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// export default App;


// src/App.js
// =============================
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import OtpPage from './pages/OtpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
return (
<Router>
<Navbar />
<Routes>
<Route path="/" element={<HomePage />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/verify-otp" element={<OtpPage />} />
<Route path="/login" element={<LoginPage />} />


{/* Protected Dashboard */}
<Route
path="/dashboard"
element={
<ProtectedRoute>
<DashboardPage />
</ProtectedRoute>
}
/>
</Routes>
</Router>
);
}


export default App;