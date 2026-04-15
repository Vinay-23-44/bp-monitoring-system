import React, { useState } from "react";
import useAuth from "../context/authContext";
import auth from "../lib/auth";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    const { token, user } = await signup({ name, email, password });
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
          <h1 className="auth-showcase__title">Build a smarter health routine from day one.</h1>
          <p className="auth-showcase__text">
            Create your account to unlock blood pressure analytics, medication
            support, profile-aware assistant guidance, and consultation workflows.
          </p>
          <div className="auth-showcase__grid">
            <div className="auth-showcase__card">
              <span>Guided Monitoring</span>
              <strong>Turn scattered readings into structured health decisions.</strong>
            </div>
            <div className="auth-showcase__card">
              <span>Premium Experience</span>
              <strong>Thoughtful dashboards, clear actions, and personalized support.</strong>
            </div>
          </div>
        </div>
        <div className="auth-showcase__orbit auth-showcase__orbit--one" />
        <div className="auth-showcase__orbit auth-showcase__orbit--two" />
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="auth-card__eyebrow">Create Account</p>
          <h2 className="auth-card__title">Start your premium health workspace</h2>
          <p className="auth-card__subtitle">
            Set up your account and begin tracking your health with a cleaner, more guided experience.
          </p>

          <form onSubmit={formSubmitHandler} className="auth-form">
            <label className="auth-field">
              <span>Full name</span>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="Enter your full name"
              />
            </label>

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
                placeholder="Create a secure password"
              />
            </label>

            <div className="auth-meta">
              <span>Designed for ongoing health tracking and care support</span>
              <span className="auth-meta__pill">Profile-first setup</span>
            </div>

            <button type="submit" className="auth-submit">Create Account</button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <button className="auth-footer__link" onClick={() => navigate("/signin")}>
              Sign in
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;