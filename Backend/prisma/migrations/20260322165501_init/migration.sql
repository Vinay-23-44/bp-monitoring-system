/*
  Warnings:

  - A unique constraint covering the columns `[medicationId,scheduledTime]` on the table `MedicationLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MedicationLog" ADD COLUMN     "isMissed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MedicationSchedule" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "MedicationLog_medicationId_scheduledTime_key" ON "MedicationLog"("medicationId", "scheduledTime");