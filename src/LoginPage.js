import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Fungsi ini sudah async
    setIsLoading(true); // Mulai loading sebelum request
    try {
      const payload = { email, password };
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/login`,
        payload
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user_id", response.data.user.id);
        localStorage.setItem("username", response.data.user.name);
        navigate("/schedules"); // Redirect ke halaman jadwal
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Hentikan loading setelah request selesai
    }
  };

  return (
    <div className="container mt-5">
      {isLoading && <LoadingSpinner />}
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
}
