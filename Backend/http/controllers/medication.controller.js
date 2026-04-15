import { Prisma, PrismaClient } from "@prisma/client";
import { generateLogs } from "../service/medicationService.js";
const prisma = new PrismaClient();
export const addMedication = async (req, res) => {

  try {

    const { medicineName, dosage, time } = req.body

    const userId = req.user.id
    
    const medication = await prisma.medicationSchedule.create({
      data: {
        medicineName,
        dosage,
        time,
        userId
        
      }
    })
    await generateLogs(medication.id, time);
    res.status(201).json(medication)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserMedications = async (req, res) => {

  try {

    const userId = req.user.id
    console.log("checking db ")
    const medications = await prisma.medicationSchedule.findMany({
      where: { userId },
     include: {
        logs: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })
    
    res.json(medications)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}
//  Mark as Taken
export const markMedicationTaken = async (req, res) => {
  try {
    const { logId } = req.body;
    const id = Number(logId);
    console.log(id);
    console.log("request received on backend")
    const log = await prisma.medicationLog.findUnique({
      where: { 
         id
        
      }
    });
     console.log(log);
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    await prisma.medicationLog.update({
      where: {
          // medicationId:id,
        id,
        //scheduledTime:Date.now()
       },
      data: {
        taken: true,
        takenAt: new Date()
      }
    });

    res.json({ message: "Medication marked as taken" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const deleteMedication = async(req,res)=>{
  try {
    const {id} = req.params;
    const medicationId = Number(id);
    const medication = await prisma.medicationSchedule.findUnique({
      where :{id:medicationId}
    });
    if(!medication) {
      return res.status(404).json({
        message:"Medication not found"
      });

    }
    await prisma.medicationLog.deleteMany({
      where:{medicationId}
    });
    await prisma.medicationSchedule.delete({
      where:{id:medicationId}
    })
    res.json({
      message:"medication deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:"Internal server Error, please try again later !"
    })
  }
}

// export const updateMedicationTime = async (req, res) => {

//   try {
//     const { id } = req.params;
//     const { time } = req.body; 

//     const medication = await prisma.medicationSchedule.findUnique({
//       where: { id: Number(id) } 
//     });

//     if (!medication) {
//       return res.status(404).json({
//         message: "Medication not found"
//       });
//     }

//     await prisma.medicationSchedule.update({
//       where: { id: Number(id) }, 
//       data: {
//         time 
//       }
//     });

//     res.json({
//       message: "Time updated successfully"
//     });

//   } catch (error) {
//     res.status(500).json({
//       message: "Couldn't update time at this moment!"
//     });
//   }
// };

export const updateMedicationTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { time } = req.body; 

    const medicationId = Number(id);

    
    await prisma.medicationSchedule.update({
      where: { id: medicationId },
      data: { time }
    });

    
    const futureLogs = await prisma.medicationLog.findMany({
      where: {
        medicationId,
        scheduledTime: {
          gte: new Date() // only future logs
        }
      }
    });

    
    const [hours, minutes] = time.split(":");

    
    const updatePromises = futureLogs.map((log) => {
      const newDate = new Date(log.scheduledTime);

      newDate.setHours(Number(hours));
      newDate.setMinutes(Number(minutes));
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);

      return prisma.medicationLog.update({
        where: { id: log.id },
        data: {
          scheduledTime: newDate
        }
      });
    });

    await Promise.all(updatePromises);

    res.json({
      message: "Future logs updated successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Couldn't update time"
    });
  }
};