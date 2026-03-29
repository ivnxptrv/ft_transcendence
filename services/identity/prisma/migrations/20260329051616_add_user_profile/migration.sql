-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('pending', 'active', 'flagged', 'suspended');

-- CreateEnum
CREATE TYPE "AvailabilityDay" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderProfile" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "status" "ProviderStatus" NOT NULL DEFAULT 'pending',
    "tags" TEXT[],
    "location" TEXT,
    "languages" TEXT[],
    "yearsExperience" INTEGER,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "providerProfileId" TEXT NOT NULL,
    "day" "AvailabilityDay" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_userId_idx" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_profileId_key" ON "ProviderProfile"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderProfile_userId_key" ON "ProviderProfile"("userId");

-- CreateIndex
CREATE INDEX "ProviderProfile_userId_idx" ON "ProviderProfile"("userId");

-- CreateIndex
CREATE INDEX "ProviderProfile_status_idx" ON "ProviderProfile"("status");

-- CreateIndex
CREATE INDEX "ProviderProfile_isAvailable_idx" ON "ProviderProfile"("isAvailable");

-- CreateIndex
CREATE INDEX "TimeSlot_providerProfileId_idx" ON "TimeSlot"("providerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TimeSlot_providerProfileId_day_startTime_key" ON "TimeSlot"("providerProfileId", "day", "startTime");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderProfile" ADD CONSTRAINT "ProviderProfile_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_providerProfileId_fkey" FOREIGN KEY ("providerProfileId") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
