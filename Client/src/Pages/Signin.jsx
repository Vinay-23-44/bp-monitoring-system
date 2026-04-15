import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/authContext";
import auth from "../lib/auth";
import "../styles/auth.css";

const Signin = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { signin } = useAuth();

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    const { user, token } = await signin({ email, password });
    auth.token = token;
    auth.user = user;
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <section className="auth-showcase">
        <div className="auth-showcase__brand">
          <span className="auth-showcase__brand-mark" />
          HealthApp
        </div>
        <div className="auth-showcase__content">
          <h1 className="auth-showcase__title">Carefully designed health intelligence.</h1>
          <p className="auth-showcase__text">
            Monitor blood pressure, medication, consultations, and profile-based
            guidance in one premium patient workspace.
          </p>
          <div className="auth-showcase__grid">
            <div className="auth-showcase__card">
              <span>Live Tracking</span>
              <strong>BP trends, reminders, and health insights in one view.</strong>
            </div>
            <div className="auth-showcase__card">
              <span>Personalized</span>
              <strong>Recommendations built from your profile, diet, and habits.</strong>
            </div>
          </div>
        </div>
        <div className="auth-showcase__orbit auth-showcase__orbit--one" />
        <div className="auth-showcase__orbit auth-showcase__orbit--two" />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="auth-card__eyebrow">Welcome Back</p>
          <h2 className="auth-card__title">Sign in to your dashboard</h2>
          <p className="auth-card__subtitle">
            Pick up where you left off with your health history and recommendations.
          </p>

          <form onSubmit={formSubmitHandler} className="auth-form">
            <label className="auth-field">
              <span>Email address</span>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="name@example.com"
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Enter your password"
              />
            </label>

            <div className="auth-meta">
              <span>Secure access to your health records</span>
              <span className="auth-meta__pill">Encrypted session</span>
            </div>

            <button type="submit" className="auth-submit">Sign In</button>
          </form>

          <div className="auth-footer">
            <span>New here? Create your account to start monitoring.</span>
            <button className="auth-footer__link" onClick={() => navigate("/signup")}>
              Create account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signin;