// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const buildHealthProfile = async (userId) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     include: {
//       healthProfile: true,
//       bloodPressures: {
//         orderBy: { createdAt: "desc" },
//         take: 10
//       }
//     }
//   });

//   const hp = user.healthProfile;

//   // BMI
//   let bmi = null;
//   if (hp?.height && hp?.weight) {
//     const h = hp.height / 100;
//     bmi = hp.weight / (h * h);
//   }

//   // Avg BP
//   const avgSys =
//     user.bloodPressures.reduce((a, b) => a + b.systolic, 0) /
//     (user.bloodPressures.length || 1);

//   const avgDia =
//     user.bloodPressures.reduce((a, b) => a + b.diastolic, 0) /
//     (user.bloodPressures.length || 1);

//   return {
//     bmi,
//     isSmoker: hp?.isSmoker,
//     exerciseFrequency: hp?.exerciseFrequency,
//     dietType: hp?.dietType,
//     stressLevel: hp?.stressLevel,
//     avgBP: { systolic: avgSys, diastolic: avgDia },
//     medicalConditions: hp?.medicalConditions || []
//   };
// };