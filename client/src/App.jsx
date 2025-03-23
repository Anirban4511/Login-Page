import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
// import './App.css'
import "./index.css";
import { Routes, Route } from "react-router-dom";
import Verifyemail from "./pages/Verifyemail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home></Home>} />
        <Route path="/login" element={<Login></Login>} />
        <Route path="/email-verify" element={<Verifyemail></Verifyemail>} />
        <Route
          path="/reset-password"
          element={<ResetPassword></ResetPassword>}
        />
      </Routes>
    </div>
  );
}

export default App;
