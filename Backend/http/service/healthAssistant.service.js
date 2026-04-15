import axios from "axios";

const BP_THRESHOLDS = {
  elevated: { systolic: 120, diastolic: 80 },
  stage1: { systolic: 130, diastolic: 80 },
  stage2: { systolic: 140, diastolic: 90 },
};

const ASSISTANCE_API_URL = (process.env.ASSISTANCE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const ASSISTANCE_API_KEY = process.env.ASSISTANCE_API_KEY || process.env.APP_API_KEY || "";
const ASSISTANCE_TIMEOUT_MS = Number(process.env.ASSISTANCE_TIMEOUT_MS || 10000);

const symptomTriggers = [
  "chest pain",
  "shortness of breath",
  "breathlessness",
  "vision loss",
  "blurred vision",
  "weakness",
  "numbness",
  "severe headache",
  "confusion",
  "fainting",
  "dizziness",
];

function normalizeList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => `${item}`.trim())
    .filter(Boolean);
}

function calculateBMI(profile) {
  if (!profile?.weight || !profile?.height) {
    return null;
  }

  const heightInMeters = Number(profile.height) / 100;
  if (!heightInMeters) {
    return null;
  }

  return Number((Number(profile.weight) / (heightInMeters * heightInMeters)).toFixed(1));
}

function getBPStatus(latestBP) {
  if (!latestBP) {
    return {
      label: "Unknown",
      severity: 1,
      notes: ["No blood pressure reading saved yet."],
    };
  }

  const systolic = Number(latestBP.systolic);
  const diastolic = Number(latestBP.diastolic);

  if (systolic >= BP_THRESHOLDS.stage2.systolic || diastolic >= BP_THRESHOLDS.stage2.diastolic) {
    return {
      label: "Stage 2",
      severity: 4,
      notes: [
        "Your latest reading is in a high blood pressure range.",
        "Medical follow-up should not be delayed if this pattern continues.",
      ],
    };
  }

  if (systolic >= BP_THRESHOLDS.stage1.systolic || diastolic >= BP_THRESHOLDS.stage1.diastolic) {
    return {
      label: "Stage 1",
      severity: 3,
      notes: [
        "Your latest reading is above the ideal range.",
        "Daily routine changes and closer monitoring matter here.",
      ],
    };
  }

  if (systolic >= BP_THRESHOLDS.elevated.systolic && diastolic < BP_THRESHOLDS.elevated.diastolic) {
    return {
      label: "Elevated",
      severity: 2,
      notes: ["Your systolic pressure is slightly elevated."],
    };
  }

  return {
    label: "Normal",
    severity: 1,
    notes: ["Your latest blood pressure is in a healthier range."],
  };
}

function getDietRecommendations(profile, metrics) {
  const dietType = (profile?.dietType || "").toLowerCase();
  const recommendations = [
    "Keep salt intake controlled and avoid heavily processed packaged foods.",
    "Use consistent meal timing instead of large, irregular meals.",
  ];

  if (dietType === "veg" || dietType === "vegetarian") {
    recommendations.push("Build meals around dal, beans, paneer, curd, sprouts, vegetables, and whole grains.");
    recommendations.push("Include protein in each major meal so vegetarian eating stays balanced.");
  } else if (dietType === "vegan") {
    recommendations.push("Use beans, lentils, tofu, soy, nuts, and seeds to keep protein intake stable.");
    recommendations.push("Watch vitamin B12, iron, and omega-3 intake if your diet is fully vegan.");
  } else if (dietType === "non-veg" || dietType === "non veg") {
    recommendations.push("Prefer lean protein such as fish, eggs, and grilled chicken over fried or processed meats.");
    recommendations.push("Keep red meat and very salty meat preparations limited.");
  } else {
    recommendations.push("Pick a diet pattern you can follow consistently, with vegetables, protein, and fiber in every meal.");
  }

  if (metrics.bmi && metrics.bmi >= 25) {
    recommendations.push("Use smaller portions, more fiber, and fewer sugary drinks to support weight reduction.");
  }

  if ((profile?.healthGoal || "").toLowerCase().includes("weight")) {
    recommendations.push("Center your diet on calorie control, high satiety foods, and fewer fried snacks.");
  }

  if ((profile?.healthGoal || "").toLowerCase().includes("bp")) {
    recommendations.push("A DASH-style pattern with fruits, vegetables, curd, nuts, and lower sodium is a strong fit for BP control.");
  }

  if ((profile?.junkFoodLevel || "").toLowerCase() === "high") {
    recommendations.push("Reduce junk food frequency first. That single change will improve BP, recovery, and energy.");
  }

  return recommendations;
}

function getLifestyleRecommendations(profile, metrics, bpStatus) {
  const recommendations = [];

  if (profile?.isSmoker === true) {
    recommendations.push("Smoking is a major risk driver in your profile. Quitting should be one of your top priorities.");
  }

  if ((profile?.alcoholUse || "").toLowerCase() === "frequent") {
    recommendations.push("Frequent alcohol use can worsen BP control and sleep quality. Reducing intake would help.");
  }

  if (!profile?.exerciseFrequency || Number(profile.exerciseFrequency) < 3) {
    recommendations.push("Increase activity gradually toward at least 150 minutes per week, starting with regular walking.");
  }

  if (profile?.sleepHours && Number(profile.sleepHours) < 7) {
    recommendations.push("Your sleep duration looks low. Improving sleep can help stress, appetite, and blood pressure.");
  }

  if (profile?.waterIntake && Number(profile.waterIntake) < 2) {
    recommendations.push("Hydration looks low. Aim for steadier water intake across the day unless your clinician restricts fluids.");
  }

  if (profile?.stressLevel && Number(profile.stressLevel) >= 7) {
    recommendations.push("High stress is showing in your profile. Add a daily decompression routine such as walking, breathing work, or journaling.");
  }

  recommendations.push(...bpStatus.notes);

  if (metrics.bmi && metrics.bmi >= 30) {
    recommendations.push("Your BMI suggests obesity range, so weight loss would likely improve blood pressure and overall risk.");
  } else if (metrics.bmi && metrics.bmi >= 25) {
    recommendations.push("A moderate weight reduction could improve your cardiovascular risk profile.");
  }

  return recommendations;
}

function getRiskLevel(profile, metrics, bpStatus) {
  let score = bpStatus.severity;

  if (profile?.isSmoker) score += 2;
  if ((profile?.alcoholUse || "").toLowerCase() === "frequent") score += 1;
  if ((profile?.junkFoodLevel || "").toLowerCase() === "high") score += 1;
  if (profile?.stressLevel && Number(profile.stressLevel) >= 7) score += 1;
  if (!profile?.exerciseFrequency || Number(profile.exerciseFrequency) < 3) score += 1;
  if (metrics.bmi && metrics.bmi >= 30) score += 2;
  else if (metrics.bmi && metrics.bmi >= 25) score += 1;

  const conditions = normalizeList(profile?.medicalConditions).map((item) => item.toLowerCase());
  if (conditions.some((item) => ["hypertension", "diabetes", "heart disease"].includes(item))) {
    score += 2;
  }

  if (score >= 8) return "high";
  if (score >= 5) return "moderate";
  return "low";
}

function getMissingFields(profile, latestBP) {
  const missing = [];

  if (!profile?.age) missing.push("age");
  if (!profile?.weight) missing.push("weight");
  if (!profile?.height) missing.push("height");
  if (typeof profile?.isSmoker !== "boolean") missing.push("smoking status");
  if (!profile?.dietType) missing.push("diet type");
  if (!profile?.exerciseFrequency) missing.push("exercise frequency");
  if (!latestBP) missing.push("blood pressure reading");

  return missing;
}

function buildProfileSnapshot(profile, latestBP, metrics, riskLevel) {
  return {
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
    weight: profile?.weight ?? null,
    height: profile?.height ?? null,
    bmi: metrics.bmi,
    dietType: profile?.dietType ?? null,
    healthGoal: profile?.healthGoal ?? null,
    isSmoker: profile?.isSmoker ?? null,
    exerciseFrequency: profile?.exerciseFrequency ?? null,
    exerciseTypes: normalizeList(profile?.exerciseTypes),
    medicalConditions: normalizeList(profile?.medicalConditions),
    familyHistory: normalizeList(profile?.familyHistory),
    latestBloodPressure: latestBP
      ? {
          systolic: latestBP.systolic,
          diastolic: latestBP.diastolic,
          recordedAt: latestBP.createdAt,
        }
      : null,
    riskLevel,
  };
}

function inferActiveTopic(query, history) {
  const combined = [query, ...history.slice(-6).map((entry) => entry.text.toLowerCase())].join(" ");

  if (/(diet|food|meal|nutrition|veg|vegan|non veg|protein)/.test(combined)) {
    return "diet";
  }

  if (/(bp|pressure|reading|hypertension|systolic|diastolic)/.test(combined)) {
    return "bp";
  }

  if (/(exercise|activity|walk|workout|gym|training)/.test(combined)) {
    return "exercise";
  }

  if (/(sleep|stress|anxiety|rest|recovery)/.test(combined)) {
    return "recovery";
  }

  if (/(weight|bmi|fat|calorie)/.test(combined)) {
    return "weight";
  }

  return "general";
}

function getFollowUpPrompts(topic) {
  if (topic === "diet") {
    return [
      "Give me a one-day meal plan",
      "What should I avoid eating?",
      "How much protein should I target?",
    ];
  }

  if (topic === "bp") {
    return [
      "How often should I check BP?",
      "What daily habits reduce BP?",
      "When should I consult a doctor?",
    ];
  }

  if (topic === "exercise") {
    return [
      "Suggest a beginner exercise routine",
      "How much walking is enough?",
      "What exercise is safe for BP?",
    ];
  }

  return [
    "Give me a full health summary",
    "What should I focus on this week?",
    "How can I improve my routine?",
  ];
}

function normalizeChatHistory(chatHistory) {
  if (!Array.isArray(chatHistory)) {
    return [];
  }

  return chatHistory
    .map((entry) => ({
      sender: entry?.sender || "user",
      text: `${entry?.text || ""}`.trim(),
    }))
    .filter((entry) => entry.text);
}

function extractSymptoms(message) {
  const lowerMessage = `${message || ""}`.toLowerCase();
  return symptomTriggers.filter((symptom) => lowerMessage.includes(symptom));
}

function sanitizeAssistantReply(reply) {
  const cleaned = `${reply || ""}`.trim();
  if (!cleaned) {
    return "";
  }

  // Guard against legacy fixed-template responses.
  if (/your current focus should be/i.test(cleaned)) {
    return "";
  }

  return cleaned;
}

function inferQueryModeFromMessage(message) {
  const text = `${message || ""}`.toLowerCase();

  if (/(summary|summarize|overview|recap)/.test(text)) return "summary";
  if (/(diet|meal|food|nutrition|eat)/.test(text)) return "diet";
  if (/(weekly plan|this week|focus.*week|week plan)/.test(text)) return "weekly_plan";
  if (/(improve|better|reduce|lower|control|routine|habits)/.test(text)) return "improve";
  return "general";
}

async function requestAssistanceModel({
  user,
  conversationId,
  profileSnapshot,
  latestBP,
  riskLevel,
  bpStatus,
  missingFields,
  dietRecommendations,
  lifestyleRecommendations,
  recommendations,
  message,
  chatHistory,
}) {
  const normalizedMessage = `${message || ""}`.trim();
  const normalizedChatHistory = normalizeChatHistory(chatHistory);
  const latestBPBlock = latestBP
    ? {
      systolic: latestBP.systolic ?? null,
      diastolic: latestBP.diastolic ?? null,
      recorded_at: latestBP.createdAt ? new Date(latestBP.createdAt).toISOString() : null,
    }
    : {
      systolic: null,
      diastolic: null,
      recorded_at: null,
    };

  const payload = {
    user_id: `${user?.id || "anonymous-user"}`,
    conversation_id: `${conversationId || `${user?.id || "anonymous-user"}-default`}`,
    user_name: user?.name || null,
    message: normalizedMessage,
    profile_snapshot: profileSnapshot,
    risk_level: riskLevel,
    blood_pressure_status: bpStatus?.label || "Unknown",
    missing_fields: missingFields,
    diet_recommendations: dietRecommendations,
    lifestyle_recommendations: lifestyleRecommendations,
    recommendations,
    chat_history: normalizedChatHistory,
    latest_bp: latestBPBlock,
    systolic: latestBP?.systolic ?? null,
    diastolic: latestBP?.diastolic ?? null,
    symptoms: extractSymptoms(normalizedMessage),
  };
  console.info("Assistance payload ready", {
    conversation_id: payload.conversation_id,
    message: payload.message,
    risk_level: payload.risk_level,
    blood_pressure_status: payload.blood_pressure_status,
    chat_history_count: payload.chat_history.length,
  });

  const headers = {};
  if (ASSISTANCE_API_KEY) {
    headers["X-API-Key"] = ASSISTANCE_API_KEY;
  }

  const { data } = await axios.post(`${ASSISTANCE_API_URL}/chat`, payload, {
    headers,
    timeout: ASSISTANCE_TIMEOUT_MS,
  });

  return data;
}

function buildLocalFallbackReply({ message }) {
  const mode = inferQueryModeFromMessage(message);
  if (mode === "diet") {
    return "I could not fetch the assistant response right now. Ask again and I will focus only on diet recommendations.";
  }
  if (mode === "summary") {
    return "I could not fetch the assistant response right now. Ask again and I will provide a structured health summary.";
  }
  if (mode === "improve") {
    return "I could not fetch the assistant response right now. Ask again and I will focus on practical BP improvement habits.";
  }
  if (mode === "weekly_plan") {
    return "I could not fetch the assistant response right now. Ask again and I will create a short weekly action plan.";
  }
  return "I could not fetch the assistant response right now. Please try again.";
}

export async function buildHealthAssistantResponse({ user, profile, latestBP, message, chatHistory, conversationId }) {
  const hydratedProfile = {
    ...profile,
    user,
  };
  const metrics = {
    bmi: calculateBMI(hydratedProfile),
  };
  const bpStatus = getBPStatus(latestBP);
  const riskLevel = getRiskLevel(hydratedProfile, metrics, bpStatus);
  const missingFields = getMissingFields(hydratedProfile, latestBP);
  const dietRecommendations = getDietRecommendations(hydratedProfile, metrics);
  const lifestyleRecommendations = getLifestyleRecommendations(hydratedProfile, metrics, bpStatus);
  const profileSnapshot = buildProfileSnapshot(hydratedProfile, latestBP, metrics, riskLevel);
  const normalizedHistory = normalizeChatHistory(chatHistory);
  const activeTopic = inferActiveTopic(`${message || ""}`.toLowerCase(), normalizedHistory);
  const recommendations = [...dietRecommendations, ...lifestyleRecommendations].slice(0, 8);

  let assistanceResponse = null;

  try {
    assistanceResponse = await requestAssistanceModel({
      user,
      conversationId,
      profileSnapshot,
      latestBP,
      riskLevel,
      bpStatus,
      missingFields,
      dietRecommendations,
      lifestyleRecommendations,
      recommendations,
      message: `${message || ""}`,
      chatHistory: normalizedHistory,
    });
  } catch (error) {
    console.error("Assistance model request failed:", error.message);
  }

  const llmReply = sanitizeAssistantReply(assistanceResponse?.reply);
  const hasUsableLlmReply = Boolean(llmReply);
  const finalReply = hasUsableLlmReply
    ? llmReply
    : buildLocalFallbackReply({
      message,
    });
  const finalAssistanceSource = hasUsableLlmReply
    ? (assistanceResponse?.assistance_source || "Assistance")
    : "local-fallback";

  return {
    profileSnapshot,
    missingFields,
    riskLevel,
    bloodPressureStatus: bpStatus.label,
    recommendations,
    dietRecommendations,
    lifestyleRecommendations,
    reply: finalReply,
    activeTopic,
    followUpPrompts: getFollowUpPrompts(activeTopic),
    sentiment: assistanceResponse?.sentiment || "neutral",
    safetyLevel: assistanceResponse?.safety_level || "routine",
    safetyReasons: assistanceResponse?.safety_reasons || bpStatus.notes,
    assistanceSource: finalAssistanceSource,
  };
}
