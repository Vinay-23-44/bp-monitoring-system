-- CreateTable
CREATE TABLE "BloodPressure" (
    "id" SERIAL NOT NULL,
    "systolic" INTEGER NOT NULL,
    "diastolic" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,

    CONSTRAINT "BloodPressure_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BloodPressure" ADD CONSTRAINT "BloodPressure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
