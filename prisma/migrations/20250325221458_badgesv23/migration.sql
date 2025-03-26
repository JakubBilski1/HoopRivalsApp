/*
  Warnings:

  - You are about to drop the `ChallengeBadges` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChallengeBadges" DROP CONSTRAINT "ChallengeBadges_challengeId_fkey";

-- DropTable
DROP TABLE "ChallengeBadges";

-- CreateTable
CREATE TABLE "ChallengeBadge" (
    "id" SERIAL NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,
    "challengeId" INTEGER,

    CONSTRAINT "ChallengeBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeBadge_challengeId_key" ON "ChallengeBadge"("challengeId");

-- AddForeignKey
ALTER TABLE "ChallengeBadge" ADD CONSTRAINT "ChallengeBadge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE SET NULL ON UPDATE CASCADE;
