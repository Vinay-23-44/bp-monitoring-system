import { useNavigate } from "react-router-dom";
import ChatBot from "../components/ChatBot";
import "../styles/assistance.css";

const highlightCards = [
  {
    title: "Profile-aware guidance",
    description:
      "The assistant uses your saved profile, blood pressure history, and current health context to personalize answers.",
  },
  {
    title: "Actionable follow-ups",
    description:
      "Ask about diet, exercise, sleep, stress, or weekly priorities and get next-step prompts instead of generic tips.",
  },
  {
    title: "Better focus",
    description:
      "This dedicated view keeps the conversation front and center so users do not miss the assistance feature inside the dashboard.",
  },
];

const quickStarts = [
  "Give me a full health summary",
  "How can I improve my blood pressure this week?",
  "What habits should I change first?",
];

const AssistancePage = () => {
  const navigate = useNavigate();

  return (
    <div className="assistance-page">
      <section className="assistance-page__hero">
        <div className="assistance-page__hero-copy">
          <p className="assistance-page__eyebrow">Health Assistance</p>
          <h1>Your dedicated health guidance workspace</h1>
          <p className="assistance-page__intro">
            Ask focused questions about blood pressure, food, routines, symptoms, and weekly
            priorities without competing with the rest of the dashboard tools.
          </p>

          <div className="assistance-page__actions">
            <button
              type="button"
              className="assistance-page__primary"
              onClick={() => navigate("/profile")}
            >
              Improve profile context
            </button>
            <button
              type="button"
              className="assistance-page__secondary"
              onClick={() => navigate("/dashboard")}
            >
              Back to dashboard
            </button>
          </div>
        </div>

        <aside className="assistance-page__focus-card">
          <span>Best results come from complete data</span>
          <strong>Keep profile, BP history, and daily habits updated.</strong>
          <p>The assistant becomes more accurate when recent readings and lifestyle details exist.</p>
        </aside>
      </section>

      <section className="assistance-page__highlights">
        {highlightCards.map((card) => (
          <article key={card.title} className="assistance-page__highlight-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <section className="assistance-page__workspace">
        <div className="assistance-page__workspace-header">
          <div>
            <p className="assistance-page__eyebrow">Assistant Console</p>
            <h2>Ask for targeted advice</h2>
          </div>
          <div className="assistance-page__quick-starts">
            {quickStarts.map((item) => (
              <span key={item} className="assistance-page__quick-pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="assistance-page__chat-shell">
          <ChatBot />
        </div>
      </section>
    </div>
  );
};

export default AssistancePage;