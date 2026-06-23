/*
  Warnings:

  - You are about to drop the column `sharedPasswordEncrypted` on the `ToolSubscription` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LobbyStatus" AS ENUM ('waiting', 'processing', 'completed', 'expired');

-- CreateEnum
CREATE TYPE "MemberLobbyStatus" AS ENUM ('paid', 'refunded');

-- CreateEnum
CREATE TYPE "AccessMethod" AS ENUM ('INVITATION_LINK', 'API_PROXY');

-- AlterTable
ALTER TABLE "ToolSubscription" DROP COLUMN "sharedPasswordEncrypted";

-- CreateTable
CREATE TABLE "Lobby" (
    "id" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "pricePerSeat" DOUBLE PRECISION NOT NULL,
    "fullPrice" DOUBLE PRECISION NOT NULL,
    "status" "LobbyStatus" NOT NULL DEFAULT 'waiting',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessToken" TEXT,
    "accessMethod" "AccessMethod" NOT NULL DEFAULT 'INVITATION_LINK',
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbyMember" (
    "id" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatIndex" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "MemberLobbyStatus" NOT NULL DEFAULT 'paid',
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lobbyId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyMember" ADD CONSTRAINT "LobbyMember_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyMember" ADD CONSTRAINT "LobbyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE CASCADE ON UPDATE CASCADE;
