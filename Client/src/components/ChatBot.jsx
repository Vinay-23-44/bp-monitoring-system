import React, { useEffect, useState } from "react";
import { assistanceApi } from "../api/assistanceApi";
import "../styles/dashboard.css";

const suggestedPrompts = [
  "Give me a full health summary",
  "What diet should I follow?",
  "How can I improve my blood pressure?",
  "What should I focus on this week?",
];

const riskToneMap = {
  low: "var(--success-strong)",
  moderate: "var(--warning-strong)",
  high: "var(--danger-strong)",
};

const safetyToneMap = {
  routine: "var(--success-strong)",
  caution: "var(--warning-strong)",
  emergency: "var(--danger-strong)",
};

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Loading your personalized assistance..." },
  ]);
  const [loading, setLoading] = useState(true);
  const [assistantContext, setAssistantContext] = useState(null);

  const loadAssistant = async (message = "", chatHistoryOverride = null) => {
    setLoading(true);

    try {
      const chatHistory = (chatHistoryOverride || messages)
        .filter((item) => item.text)
        .map((item) => ({
          sender: item.sender,
          text: item.text,
        }));
      const response = await assistanceApi.getAssistantResponse(message, chatHistory);
      const data = response.data;
      setAssistantContext(data);

      if (!message) {
        setMessages([
          {
            sender: "bot",
            text: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply,
          },
        ]);
      }
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I could not generate guidance right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssistant();
  }, []);

  const sendMessage = async (messageOverride) => {
    const message = (messageOverride ?? input).trim();
    if (!message || loading) {
      return;
    }

    const nextMessages = [...messages, { sender: "user", text: message }];
    setMessages(nextMessages);
    setInput("");
    await loadAssistant(message, nextMessages);
  };

  const resetChat = async () => {
    setMessages([{ sender: "bot", text: "Refreshing your saved assistance context..." }]);
    setInput("");
    await loadAssistant();
  };

  return (
    <div className="chatbot">
      <div className="chat-header">
        <h2>Smart Assistance</h2>
        <button className="reset-btn" type="button" onClick={resetChat}>
          Refresh Context
        </button>
      </div>

      {assistantContext && (
        <div className="assistant-insight">
          <div className="assistant-insight__chip">
            Risk:
            <strong style={{ color: riskToneMap[assistantContext.riskLevel] || "var(--primary)" }}>
              {` ${assistantContext.riskLevel}`}
            </strong>
          </div>
          <div className="assistant-insight__chip">
            BP Status:
            <strong>{` ${assistantContext.bloodPressureStatus}`}</strong>
          </div>
          <div className="assistant-insight__chip">
            Safety:
            <strong style={{ color: safetyToneMap[assistantContext.safetyLevel] || "var(--primary)" }}>
              {` ${assistantContext.safetyLevel}`}
            </strong>
          </div>
          <div className="assistant-insight__chip">
            Source:
            <strong>{` ${assistantContext.assistanceSource}`}</strong>
          </div>
          {assistantContext.profileSnapshot?.dietType && (
            <div className="assistant-insight__chip">
              Diet:
              <strong>{` ${assistantContext.profileSnapshot.dietType}`}</strong>
            </div>
          )}
          {assistantContext.profileSnapshot?.bmi && (
            <div className="assistant-insight__chip">
              BMI:
              <strong>{` ${assistantContext.profileSnapshot.bmi}`}</strong>
            </div>
          )}
        </div>
      )}

      {assistantContext?.safetyReasons?.length > 0 && (
        <div className="assistant-warning">
          Safety notes: {assistantContext.safetyReasons.join(" ")}
        </div>
      )}

      {assistantContext?.missingFields?.length > 0 && (
        <div className="assistant-warning">
          Add these profile fields for better recommendations: {assistantContext.missingFields.join(", ")}.
        </div>
      )}

      {assistantContext?.dietRecommendations?.length > 0 && (
        <div className="assistant-recommendation-list">
          <h3>Diet Priorities</h3>
          <ul>
            {assistantContext.dietRecommendations.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {assistantContext?.followUpPrompts?.length > 0 && (
        <div className="assistant-recommendation-list">
          <h3>Suggested Follow-ups</h3>
          <div className="assistant-prompts assistant-prompts--inline">
            {assistantContext.followUpPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="assistant-prompt"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "bot" ? "bot-msg" : "user-msg"}
          >
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <div className="assistant-prompts">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="assistant-prompt"
            onClick={() => sendMessage(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            loading
              ? "Loading your profile-based recommendations..."
              : "Ask about BP, food, exercise, symptoms, stress, sleep, or your weekly focus..."
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button type="button" onClick={() => sendMessage()} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;