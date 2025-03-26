/*
  Warnings:

  - You are about to drop the column `badgeColor` on the `FreeThrows` table. All the data in the column will be lost.
  - You are about to drop the column `badgeIcon` on the `FreeThrows` table. All the data in the column will be lost.
  - You are about to drop the column `badgeName` on the `FreeThrows` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FreeThrows" DROP CONSTRAINT "FreeThrows_challengeId_fkey";

-- AlterTable
ALTER TABLE "Challenges" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "FreeThrows" DROP COLUMN "badgeColor",
DROP COLUMN "badgeIcon",
DROP COLUMN "badgeName";

-- CreateTable
CREATE TABLE "ChallengeBadge" (
    "id" SERIAL NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "challengeId" INTEGER,

    CONSTRAINT "ChallengeBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChallengeBadgeToChallenges" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChallengeBadgeToChallenges_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeBadge_challengeId_key" ON "ChallengeBadge"("challengeId");

-- CreateIndex
CREATE INDEX "_ChallengeBadgeToChallenges_B_index" ON "_ChallengeBadgeToChallenges"("B");

-- AddForeignKey
ALTER TABLE "FreeThrows" ADD CONSTRAINT "FreeThrows_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeBadgeToChallenges" ADD CONSTRAINT "_ChallengeBadgeToChallenges_A_fkey" FOREIGN KEY ("A") REFERENCES "ChallengeBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeBadgeToChallenges" ADD CONSTRAINT "_ChallengeBadgeToChallenges_B_fkey" FOREIGN KEY ("B") REFERENCES "Challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
