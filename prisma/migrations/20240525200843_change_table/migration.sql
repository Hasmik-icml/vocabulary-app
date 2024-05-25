-- CreateTable
CREATE TABLE "Words" (
    "id" SERIAL NOT NULL,
    "english" TEXT NOT NULL,
    "armenian" TEXT[],
    "transcription" TEXT NOT NULL,
    "status" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Words_english_key" ON "Words"("english");
