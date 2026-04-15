import {  PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const profile = await prisma.healthProfile.findUnique({
      where: {
        userId: req.user.id,
      },
    });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editProfile = async (req, res) => {
  try {
    const body = req.body.details;
    console.log(body);
    const userId = req.user.id;

    const data = {}; 

    // 🔹 Basic Info
    if (body.age !== undefined) data.age = Number(body.age);
    if (body.gender !== undefined) data.gender = body.gender;

    // 🔹 Body Metrics
    if (body.weight !== undefined) data.weight = Number(body.weight);
    if (body.height !== undefined) data.height = Number(body.height);

    // 🔹 Lifestyle
    if (body.isSmoker !== undefined) {
      data.isSmoker =
        body.isSmoker === true || body.isSmoker === "true";
    }

    if (body.alcoholUse !== undefined) data.alcoholUse = body.alcoholUse;

    if (body.exerciseFrequency !== undefined) {
      data.exerciseFrequency = Number(body.exerciseFrequency);
    }

    //  ARRAY → store directly 
    if (body.exerciseTypes !== undefined) {
      data.exerciseTypes = Array.isArray(body.exerciseTypes)
        ? body.exerciseTypes
        : [body.exerciseTypes];
    }

    if (body.sleepHours !== undefined) {
      data.sleepHours = Number(body.sleepHours);
    }

    if (body.waterIntake !== undefined) {
      data.waterIntake = Number(body.waterIntake);
    }

    // 🔹 Diet
    if (body.dietType !== undefined) data.dietType = body.dietType;
    if (body.junkFoodLevel !== undefined) data.junkFoodLevel = body.junkFoodLevel;

    // 🔹 Mental Health
    if (body.stressLevel !== undefined) {
      data.stressLevel = Number(body.stressLevel);
    }

    if (body.sleepQuality !== undefined) {
      data.sleepQuality = body.sleepQuality;
    }

    // 🔹 Medical (ARRAY)
    if (body.medicalConditions !== undefined) {
      data.medicalConditions = Array.isArray(body.medicalConditions)
        ? body.medicalConditions
        : [body.medicalConditions];
    }

    if (body.familyHistory !== undefined) {
      data.familyHistory = Array.isArray(body.familyHistory)
        ? body.familyHistory
        : [body.familyHistory];
    }

    // 🔹 Goal
    if (body.healthGoal !== undefined) {
      data.healthGoal = body.healthGoal;
    }

    const result = await prisma.healthProfile.upsert({
      where: {
        userId: userId
      },
      update: data,
      create: {
        ...data,
        userId: userId 
      }
    });

    res.json(result);

  } catch (err) {
    //console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};