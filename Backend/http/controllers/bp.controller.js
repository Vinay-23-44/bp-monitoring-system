import { createBPReading } from "../service/bp.service.js";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// export async function addBPReading(req, res,next) {
//   try {
//     const {  systolic, diastolic } = req.body;
//     const userId=req.userId;
//     if (!userId || !systolic || !diastolic) {
//       return res.status(400).json({
//         message: "userId, systolic and diastolic required"
//       });
//     }

//     const reading = await createBPReading(userId, systolic, diastolic);

//     res.status(201).json({
//       message: "Blood pressure stored",
//       data: reading
//     });

//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// }




export async function addBPReading  (req, res,next)  {
  try {

    const { systolic, diastolic } = req.body;

    const userId = req.user.id; // comes from JWT middleware

    const bp = await prisma.bloodPressure.create({
      data: {
        systolic,
        diastolic,
        userId
      }
    });

    res.json({
      message: "BP saved successfully",
      data: bp
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to save BP"
    });

  }
};



export const getBPHistory = async (req, res) => {

  try {

    const userId = req.user.id;

    const history = await prisma.bloodPressure.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({
      data: history
    });

  } catch (error) {

    res.status(500).json({
      error: "Failed to fetch BP history"
    });

  }

};