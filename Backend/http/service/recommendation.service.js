import axios from "axios";

export const getRecommendation = async (patientData) => {
  try {

    const response = await axios.post(
      "http://127.0.0.1:8001/predict",
      patientData
    );

    return response.data;

  } catch (error) {

    console.error("ML Service Error:", error.message);

    throw new Error("Failed to fetch recommendation");

  }
};