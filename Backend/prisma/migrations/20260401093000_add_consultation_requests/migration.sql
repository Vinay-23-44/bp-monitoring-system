-- CreateTable
CREATE TABLE "ConsultationRequest" (
    "id" SERIAL NOT NULL,
    "doctorName" TEXT NOT NULL,
    "doctorSpecialty" TEXT NOT NULL,
    "patientMessage" TEXT NOT NULL,
    "symptoms" TEXT,
    "preferredDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "doctorReply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "ConsultationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;