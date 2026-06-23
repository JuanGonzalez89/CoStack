-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "automatchEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancellationScheduledFor" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "category" TEXT,
ADD COLUMN     "isBusiness" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ToolSubscription" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "oauthTokenId" TEXT,
    "sharedPasswordEncrypted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "provider" TEXT,
    "providerRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ToolSubscription" ADD CONSTRAINT "ToolSubscription_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSubscription" ADD CONSTRAINT "ToolSubscription_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
