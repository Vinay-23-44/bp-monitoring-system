import { useEffect, useState } from "react";
import { consultationApi } from "../api/consultationApi";

const doctors = [
  {
    name: "Dr. Meera Sharma",
    specialty: "Cardiologist",
    summary: "Blood pressure, heart health, medication review",
  },
  {
    name: "Dr. Arjun Patel",
    specialty: "General Physician",
    summary: "Daily symptoms, follow-up care, preventive health",
  },
  {
    name: "Dr. Nisha Verma",
    specialty: "Clinical Dietitian",
    summary: "Diet plans, vegetarian and non-vegetarian nutrition support",
  },
];

const initialForm = {
  doctorName: doctors[0].name,
  doctorSpecialty: doctors[0].specialty,
  patientMessage: "",
  symptoms: "",
  preferredDate: "",
};

const ConsultationPanel = () => {
  const [consultations, setConsultations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadConsultations = async () => {
    setLoading(true);

    try {
      const data = await consultationApi.getConsultations();
      setConsultations(data);
    } catch (error) {
      console.error("Failed to load consultations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleDoctorSelect = (doctor) => {
    setForm((prev) => ({
      ...prev,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await consultationApi.createConsultation(form);
      setForm(initialForm);
      await loadConsultations();
    } catch (error) {
      console.error("Failed to create consultation", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="consultation-panel">
      <div className="consultation-directory">
        {doctors.map((doctor) => (
          <button
            key={doctor.name}
            type="button"
            className={`doctor-card${form.doctorName === doctor.name ? " doctor-card--active" : ""}`}
            onClick={() => handleDoctorSelect(doctor)}
          >
            <strong>{doctor.name}</strong>
            <span>{doctor.specialty}</span>
            <p>{doctor.summary}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="consultation-form">
        <div className="dashboard-form__grid">
          <label className="dashboard-field">
            <span>Selected doctor</span>
            <input value={form.doctorName} readOnly />
          </label>
          <label className="dashboard-field">
            <span>Specialty</span>
            <input value={form.doctorSpecialty} readOnly />
          </label>
        </div>

        <label className="dashboard-field">
          <span>Symptoms or concern</span>
          <textarea
            value={form.symptoms}
            onChange={(e) => setForm((prev) => ({ ...prev, symptoms: e.target.value }))}
            placeholder="Describe symptoms, recent BP changes, or what is worrying you."
            rows={3}
          />
        </label>

        <label className="dashboard-field">
          <span>Consultation message</span>
          <textarea
            value={form.patientMessage}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, patientMessage: e.target.value }))
            }
            placeholder="Write what you want the doctor to review."
            rows={4}
            required
          />
        </label>

        <label className="dashboard-field">
          <span>Preferred consultation date</span>
          <input
            type="datetime-local"
            value={form.preferredDate}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, preferredDate: e.target.value }))
            }
          />
        </label>

        <button type="submit" className="dashboard-primary-button" disabled={submitting}>
          {submitting ? "Submitting..." : "Request Consultation"}
        </button>
      </form>

      <div className="consultation-history">
        <div className="dashboard-panel__header">
          <div>
            <p className="dashboard-panel__eyebrow">Requests</p>
            <h3>Consultation activity</h3>
          </div>
        </div>

        {loading ? (
          <p>Loading consultations...</p>
        ) : consultations.length === 0 ? (
          <div className="dashboard-empty-state">
            <h3>No consultation requests yet</h3>
            <p>Choose a doctor and create your first request.</p>
          </div>
        ) : (
          <div className="consultation-list">
            {consultations.map((item) => (
              <article key={item.id} className="consultation-item">
                <div className="consultation-item__meta">
                  <strong>{item.doctorName}</strong>
                  <span>{item.doctorSpecialty}</span>
                  <span className={`consultation-status consultation-status--${item.status}`}>
                    {item.status}
                  </span>
                </div>
                {item.symptoms && <p><strong>Symptoms:</strong> {item.symptoms}</p>}
                <p><strong>Your note:</strong> {item.patientMessage}</p>
                {item.preferredDate && (
                  <p>
                    <strong>Preferred time:</strong>{" "}
                    {new Date(item.preferredDate).toLocaleString()}
                  </p>
                )}
                {item.doctorReply && <p><strong>Doctor reply:</strong> {item.doctorReply}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationPanel;