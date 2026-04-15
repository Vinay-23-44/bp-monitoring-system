import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createConsultationRequest(req, res) {
  try {
    const { doctorName, doctorSpecialty, patientMessage, symptoms, preferredDate } = req.body;

    const consultation = await prisma.consultationRequest.create({
      data: {
        doctorName,
        doctorSpecialty,
        patientMessage,
        symptoms: symptoms || null,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      data: consultation,
    });
  } catch (error) {
    console.error("Failed to create consultation request:", error);
    res.status(500).json({
      message: "Failed to create consultation request",
    });
  }
}

export async function getConsultationRequests(req, res) {
  try {
    const consultations = await prisma.consultationRequest.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      data: consultations,
    });
  } catch (error) {
    console.error("Failed to fetch consultation requests:", error);
    res.status(500).json({
      message: "Failed to fetch consultation requests",
    });
  }
}