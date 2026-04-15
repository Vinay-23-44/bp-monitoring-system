//import { getRecommendation } from "../services/recommendation.service.js";
import { getRecommendation } from "../service/recommendation.service.js";
export async function recommendationController  (req, res) {

  try {

    const {
      age,
      weight,
      systolic,
      diastolic,
      smoking,
      exercise
    } = req.body;

    const result = await getRecommendation({
      age,
      weight,
      systolic,
      diastolic,
      smoking,
      exercise
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};