import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Menggunakan useNavigate dari react-router-dom
import "bootstrap/dist/css/bootstrap.min.css"; // Pastikan Anda telah menginstal Bootstrap

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook untuk melakukan navigasi

  const handleLogin = async () => {
    try {
      const payload = { email, password };
      const response = await axios.post(
        "http://localhost:8000/api/login",
        payload
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.user.name); // Menyimpan token di localStorage
        navigate("/schedules"); // Redirect ke halaman jadwal
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <button
                onClick={handleLogin}
                className="btn btn-primary mt-4 w-100"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
