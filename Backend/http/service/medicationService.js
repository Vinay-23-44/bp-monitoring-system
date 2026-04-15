// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const generateLogs = async (medicationId, time) => {
//   const logs = [];

//   for (let i = 0; i < 7; i++) {
//     const date = new Date();
//     date.setDate(date.getDate() + i);

//     const [hours, minutes] = time.split(":");

//     date.setHours(Number(hours), Number(minutes), 0, 0);

//     logs.push({
//       medicationId,
//       scheduledTime: new Date(date)
//     });
//   }

//   await prisma.medicationLog.createMany({
//     data: logs,
//     skipDuplicates: true
//   });
// };



import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const generateLogs = async (medicationId, time) => {
  const logs = [];

  // time = "20:00"
  const [hours, minutes] = time.split(":");

  for (let i = 0; i < 7; i++) {
    const date = new Date();

    date.setDate(date.getDate() + i);
    date.setHours(Number(hours), Number(minutes), 0, 0);

    logs.push({
      medicationId,
      scheduledTime: new Date(date)
    });
  }

  await prisma.medicationLog.createMany({
    data: logs,
    skipDuplicates: true
  });
};