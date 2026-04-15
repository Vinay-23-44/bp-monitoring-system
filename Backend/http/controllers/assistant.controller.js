import { PrismaClient } from "@prisma/client";
import { buildHealthAssistantResponse } from "../service/healthAssistant.service.js";

const prisma = new PrismaClient();

export async function healthAssistantController(req, res) {
  try {
    const profile = await prisma.healthProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    const latestBP = await prisma.bloodPressure.findFirst({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = await buildHealthAssistantResponse({
      user: req.user,
      profile,
      latestBP,
      message: req.body?.message || "",
      chatHistory: req.body?.chatHistory || [],
      conversationId: req.body?.conversationId || `${req.user.id}-default`,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Health assistant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate health guidance",
    });
  }
}
