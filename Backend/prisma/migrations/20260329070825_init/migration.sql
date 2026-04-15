/*
  Warnings:

  - You are about to drop the column `doesExercise` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isSmoker` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "doesExercise",
DROP COLUMN "height",
DROP COLUMN "isSmoker",
DROP COLUMN "weight";

-- CreateTable
CREATE TABLE "HealthProfile" (
    "id" SERIAL NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "isSmoker" BOOLEAN,
    "alcoholUse" TEXT,
    "exerciseFrequency" INTEGER,
    "exerciseTypes" TEXT[],
    "sleepHours" DOUBLE PRECISION,
    "waterIntake" DOUBLE PRECISION,
    "dietType" TEXT,
    "junkFoodLevel" TEXT,
    "stressLevel" INTEGER,
    "sleepQuality" TEXT,
    "medicalConditions" TEXT[],
    "familyHistory" TEXT[],
    "healthGoal" TEXT,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HealthProfile_userId_key" ON "HealthProfile"("userId");

-- AddForeignKey
ALTER TABLE "HealthProfile" ADD CONSTRAINT "HealthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;