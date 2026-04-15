-- CreateTable
CREATE TABLE "MedicationSchedule" (
    "id" SERIAL NOT NULL,
    "medicineName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationLog" (
    "id" SERIAL NOT NULL,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "medicationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MedicationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MedicationSchedule" ADD CONSTRAINT "MedicationSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationLog" ADD CONSTRAINT "MedicationLog_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "MedicationSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;