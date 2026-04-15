import { useEffect, useState } from "react";
import { profileApi } from "../api/profileApi";
import { formatProfileData } from "../utils/formatData";

const initialForm = {
  age: "",
  gender: "",
  weight: "",
  height: "",
  isSmoker: "",
  alcoholUse: "",
  exerciseFrequency: "",
  exerciseTypes: "",
  sleepHours: "",
  waterIntake: "",
  dietType: "",
  junkFoodLevel: "",
  stressLevel: "",
  sleepQuality: "",
  medicalConditions: "",
  familyHistory: "",
  healthGoal: "",
};

const mapProfileToForm = (profile) => ({
  age: profile?.age?.toString() || "",
  gender: profile?.gender || "",
  weight: profile?.weight?.toString() || "",
  height: profile?.height?.toString() || "",
  isSmoker: typeof profile?.isSmoker === "boolean" ? String(profile.isSmoker) : "",
  alcoholUse: profile?.alcoholUse || "",
  exerciseFrequency: profile?.exerciseFrequency?.toString() || "",
  exerciseTypes: Array.isArray(profile?.exerciseTypes) ? profile.exerciseTypes.join(", ") : "",
  sleepHours: profile?.sleepHours?.toString() || "",
  waterIntake: profile?.waterIntake?.toString() || "",
  dietType: profile?.dietType || "",
  junkFoodLevel: profile?.junkFoodLevel || "",
  stressLevel: profile?.stressLevel?.toString() || "",
  sleepQuality: profile?.sleepQuality || "",
  medicalConditions: Array.isArray(profile?.medicalConditions)
    ? profile.medicalConditions.join(", ")
    : "",
  familyHistory: Array.isArray(profile?.familyHistory) ? profile.familyHistory.join(", ") : "",
  healthGoal: profile?.healthGoal || "",
});

const sections = [
  {
    title: "Basic details",
    description: "Core information used for health calculations and personalization.",
    fields: [
      {
        name: "age",
        label: "Age",
        type: "number",
        min: "1",
        placeholder: "Enter your age",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        placeholder: "Select gender",
        options: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "weight",
        label: "Weight (kg)",
        type: "number",
        min: "1",
        step: "0.1",
        placeholder: "Enter your weight",
      },
      {
        name: "height",
        label: "Height (cm)",
        type: "number",
        min: "1",
        step: "0.1",
        placeholder: "Enter your height",
      },
    ],
  },
  {
    title: "Habits and lifestyle",
    description: "These fields help the app tailor risk indicators and recommendations.",
    fields: [
      {
        name: "isSmoker",
        label: "Smoking status",
        type: "select",
        placeholder: "Select smoking status",
        options: [
          { value: "true", label: "Smoker" },
          { value: "false", label: "Non-smoker" },
        ],
      },
      {
        name: "alcoholUse",
        label: "Alcohol use",
        type: "select",
        placeholder: "Select alcohol use",
        options: [
          { value: "none", label: "None" },
          { value: "occasionally", label: "Occasionally" },
          { value: "frequent", label: "Frequent" },
        ],
      },
      {
        name: "exerciseFrequency",
        label: "Exercise days per week",
        type: "number",
        min: "0",
        max: "7",
        placeholder: "For example, 4",
      },
      {
        name: "sleepHours",
        label: "Sleep hours per night",
        type: "number",
        min: "0",
        max: "24",
        step: "0.5",
        placeholder: "For example, 7.5",
      },
      {
        name: "waterIntake",
        label: "Water intake (liters/day)",
        type: "number",
        min: "0",
        step: "0.1",
        placeholder: "For example, 2.5",
      },
      {
        name: "stressLevel",
        label: "Stress level (1-10)",
        type: "number",
        min: "1",
        max: "10",
        placeholder: "Rate your stress",
      },
      {
        name: "dietType",
        label: "Diet type",
        type: "select",
        placeholder: "Select diet type",
        options: [
          { value: "veg", label: "Vegetarian" },
          { value: "non-veg", label: "Non-vegetarian" },
          { value: "vegan", label: "Vegan" },
          { value: "eggetarian", label: "Eggetarian" },
        ],
      },
      {
        name: "junkFoodLevel",
        label: "Junk food intake",
        type: "select",
        placeholder: "Select intake level",
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ],
      },
      {
        name: "sleepQuality",
        label: "Sleep quality",
        type: "select",
        placeholder: "Select sleep quality",
        options: [
          { value: "good", label: "Good" },
          { value: "average", label: "Average" },
          { value: "poor", label: "Poor" },
        ],
      },
      {
        name: "exerciseTypes",
        label: "Exercise types",
        type: "textarea",
        placeholder: "Walking, yoga, cycling",
        hint: "Separate multiple activities with commas.",
        span: "full",
      },
    ],
  },
  {
    title: "Health background",
    description: "Add medical context so assistant responses stay relevant to your profile.",
    fields: [
      {
        name: "medicalConditions",
        label: "Medical conditions",
        type: "textarea",
        placeholder: "Hypertension, diabetes",
        hint: "Leave blank if none. Use commas for multiple items.",
      },
      {
        name: "familyHistory",
        label: "Family history",
        type: "textarea",
        placeholder: "High blood pressure, heart disease",
        hint: "Add conditions that run in your family.",
      },
      {
        name: "healthGoal",
        label: "Primary health goal",
        type: "textarea",
        placeholder: "Control blood pressure and improve stamina",
        hint: "Write in plain language so your dashboard guidance is easier to tailor.",
        span: "full",
      },
    ],
  },
];

const fieldCount = sections.reduce((count, section) => count + section.fields.length, 0);

const ProfileForm = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const completedFields = Object.values(form).filter((value) => value !== "").length;

  const completionPercent = Math.round((completedFields / fieldCount) * 100);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileApi.getProfile();

        if (profile) {
          setForm(mapProfileToForm(profile));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setMessage({
          type: "error",
          text: "We could not load your saved profile. You can still update the form below.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const formattedData = formatProfileData(form);
      const savedProfile = await profileApi.updateProfile(formattedData);
      setForm(mapProfileToForm(savedProfile));
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Could not update your profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: form[field.name],
      onChange: handleChange,
    };

    return (
      <label
        key={field.name}
        className={`profile-form__field${field.span === "full" ? " profile-form__field--full" : ""}`}
      >
        <span className="profile-form__label">{field.label}</span>
        {field.type === "select" ? (
          <select {...commonProps}>
            <option value="">{field.placeholder}</option>
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea {...commonProps} rows="3" placeholder={field.placeholder} />
        ) : (
          <input
            {...commonProps}
            type={field.type}
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
          />
        )}
        {field.hint ? <span className="profile-form__hint">{field.hint}</span> : null}
      </label>
    );
  };

  if (loading) {
    return (
      <div className="profile-form profile-form--loading">
        <p className="profile-form__loading">Loading profile...</p>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="profile-form__hero">
        <div>
          <p className="profile-form__eyebrow">Health Profile</p>
          <h2>Make every field easy to review later</h2>
          <p className="profile-form__intro">
            Each input now has a permanent label, so your saved information stays clear even after
            the placeholder disappears.
          </p>
        </div>
        <div className="profile-form__progress-card">
          <span className="profile-form__progress-label">Profile completion</span>
          <strong>{completionPercent}%</strong>
          <p>
            {completedFields} of {fieldCount} fields filled
          </p>
        </div>
      </div>

      {message.text ? (
        <p className={`profile-form__message profile-form__message--${message.type}`}>
          {message.text}
        </p>
      ) : null}

      {sections.map((section) => (
        <section key={section.title} className="profile-form__section">
          <div className="profile-form__section-header">
            <div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          </div>
          <div className="profile-form__grid">{section.fields.map(renderField)}</div>
        </section>
      ))}

      <div className="profile-form__footer">
        <p className="profile-form__footer-note">
          Tip: use commas for lists such as exercise types, medical conditions, and family history.
        </p>
        <button className="profile-form__submit" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;