import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import axios from "axios";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <>
      <div className="login-page-container-wrapper">
        <div className="login-form-card-container">
          <h2 className="login-title-heading-text">Login</h2>
          {error && <p className="login-error-message-text">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="login-input-group-wrapper">
              <label className="login-label-text-styling">Email</label>
              <input
                type="email"
                className="login-input-field-styling"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-input-group-wrapper">
              <label className="login-label-text-styling">Password</label>
              <input
                type="password"
                className="login-input-field-styling"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-submit-button-styling">
              Login
            </button>
          </form>
          <div className="login-links-container-wrapper">
            <p className="login-forgot-password-link" onClick={() => navigate("/forgot-password")}>
              Forgot Password?
            </p>
            <p className="login-register-user-link" onClick={() => navigate("/signup")}>
              Register as a new user
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
