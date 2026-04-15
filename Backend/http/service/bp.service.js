import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createBPReading(userId, systolic, diastolic) {
  const result = await prisma.bloodPressure.create({
    data: {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      userId: userId
    }
  });

  return result;
}

export async function getUserBPHistory(userId)  {

  const history = await prisma.bloodPressure.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return history;
};