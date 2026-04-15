import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bpApi } from "../api/bpApi";
import BPTrendDashboard from "../components/BPTrendDashboard";
import ConsultationPanel from "../components/ConsultationPanel";
import useAuth from "../context/authContext";
import MedicationReminder from "./MedicationReminder";
import "../styles/dashboard.css";

const featureTabs = [
  {
    id: "medication",
    label: "Medication Reminder",
    description: "Manage medicines, schedule timings, and mark doses as taken.",
  },
  {
    id: "update-bp",
    label: "Update BP",
    description: "Record a new blood pressure reading without leaving the page.",
  },
  {
    id: "bp-history",
    label: "Previous BP Readings",
    description: "Review your saved blood pressure history in a single view.",
  },
  {
    id: "consultation",
    label: "Consultation Support",
    description: "Send a consultation request and keep track of doctor follow-ups.",
  },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("medication");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);

    try {
      const data = await bpApi.getBPHistory();
      setHistory(data);
      setHistoryLoaded(true);
    } catch (error) {
      console.error("Failed to fetch BP history", error);
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await bpApi.updateBP({
        systolic: Number(systolic),
        diastolic: Number(diastolic),
      });

      setMessage("BP saved successfully.");
      setSystolic("");
      setDiastolic("");
    } catch (error) {
      setMessage("Failed to update BP.");
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (tabId === "bp-history" && !historyLoaded && !loading) {
      fetchHistory();
    }
  };

  return (
    <div className="dashboard-container">
      <section className="dashboard-hero card">
        <div className="dashboard-hero__copy">
          <span className="dashboard-badge">Personal Health Workspace</span>
          <h1>Health Monitoring Dashboard</h1>
          <p className="dashboard-hero__welcome">Welcome {user?.name}</p>
          <p className="dashboard-hero__text">
            Switch between medication reminders, blood pressure updates, and
            previous readings from one interactive dashboard.
          </p>
        </div>

        <div className="dashboard-hero__actions">
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() => navigate("/assistance")}
          >
            Open Assistance
          </button>
          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={() => navigate("/profile")}
          >
            Manage Profile
          </button>
          <button
            type="button"
            className="dashboard-danger-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>

      <section className="dashboard-tabs card">
        <div className="dashboard-tabs__header">
          <div>
            <p className="dashboard-tabs__eyebrow">Quick Access</p>
            <h2>Choose a feature</h2>
          </div>
          <p className="dashboard-tabs__hint">
            Click any card below to open the required tool.
          </p>
        </div>

        <div className="dashboard-tabs__nav" role="tablist" aria-label="Health tools">
          {featureTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`feature-tab${activeTab === tab.id ? " feature-tab--active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <span className="feature-tab__title">{tab.label}</span>
              <span className="feature-tab__description">{tab.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card dashboard-workspace">
          {activeTab === "medication" && (
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p className="dashboard-panel__eyebrow">Medication</p>
                  <h2>Medication reminder</h2>
                </div>
                <p className="dashboard-panel__caption">
                  Add medicines, update schedule times, and manage daily intake.
                </p>
              </div>
              <MedicationReminder />
            </div>
          )}

          {activeTab === "update-bp" && (
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p className="dashboard-panel__eyebrow">Blood Pressure</p>
                  <h2>Update blood pressure</h2>
                </div>
                <p className="dashboard-panel__caption">
                  Save your latest systolic and diastolic values.
                </p>
              </div>

              <form onSubmit={submitHandler} className="dashboard-form">
                <div className="dashboard-form__grid">
                  <label className="dashboard-field">
                    <span>Systolic</span>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                    />
                  </label>

                  <label className="dashboard-field">
                    <span>Diastolic</span>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                    />
                  </label>
                </div>

                <button type="submit" className="dashboard-primary-button">
                  Save BP
                </button>
              </form>

              {message && <p className="message">{message}</p>}
            </div>
          )}

          {activeTab === "bp-history" && (
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p className="dashboard-panel__eyebrow">History</p>
                  <h2>Previous BP readings</h2>
                </div>
                <button
                  type="button"
                  className="dashboard-secondary-button"
                  onClick={fetchHistory}
                >
                  Refresh History
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : history.length === 0 ? (
                <div className="dashboard-empty-state">
                  <h3>No readings yet</h3>
                  <p>Add a blood pressure reading to start building your history.</p>
                </div>
              ) : (
                <div className="bp-history-stack">
                  <BPTrendDashboard history={history} />

                  <div className="history-table-wrapper">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Systolic</th>
                          <th>Diastolic</th>
                          <th>BP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((bp) => (
                          <tr key={bp.id}>
                            <td>{formatDate(bp.createdAt)}</td>
                            <td>{bp.systolic}</td>
                            <td>{bp.diastolic}</td>
                            <td>
                              {bp.systolic}/{bp.diastolic}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "consultation" && (
            <div className="dashboard-panel">
              <div className="dashboard-panel__header">
                <div>
                  <p className="dashboard-panel__eyebrow">Consultation</p>
                  <h2>Patient and doctor support</h2>
                </div>
                <p className="dashboard-panel__caption">
                  Select a doctor, describe your concern, and track your request status.
                </p>
              </div>
              <ConsultationPanel />
            </div>
          )}
      </section>
    </div>
  );
};

export default Dashboard;