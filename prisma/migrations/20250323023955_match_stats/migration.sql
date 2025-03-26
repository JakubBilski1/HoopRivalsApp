/*
  Warnings:

  - You are about to drop the column `matchId` on the `Quarter` table. All the data in the column will be lost.
  - Added the required column `quarterMatchId` to the `Quarter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Quarter" DROP CONSTRAINT "Quarter_matchId_fkey";

-- AlterTable
ALTER TABLE "Quarter" DROP COLUMN "matchId",
ADD COLUMN     "quarterMatchId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "QuarterMatch" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "QuarterMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsMatch" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "PointsMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchStats" (
    "id" SERIAL NOT NULL,
    "pointsMatchId" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "twoPointsScored" INTEGER NOT NULL,
    "threePointsScored" INTEGER NOT NULL,
    "freeThrowsScored" INTEGER NOT NULL,
    "twoPointsAttempted" INTEGER NOT NULL,
    "threePointsAttempted" INTEGER NOT NULL,
    "freeThrowsAttempted" INTEGER NOT NULL,
    "rebounds" INTEGER,
    "assists" INTEGER,
    "blocks" INTEGER NOT NULL,

    CONSTRAINT "MatchStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuarterMatch_matchId_key" ON "QuarterMatch"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PointsMatch_matchId_key" ON "PointsMatch"("matchId");

-- AddForeignKey
ALTER TABLE "QuarterMatch" ADD CONSTRAINT "QuarterMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsMatch" ADD CONSTRAINT "PointsMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quarter" ADD CONSTRAINT "Quarter_quarterMatchId_fkey" FOREIGN KEY ("quarterMatchId") REFERENCES "QuarterMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStats" ADD CONSTRAINT "MatchStats_pointsMatchId_fkey" FOREIGN KEY ("pointsMatchId") REFERENCES "PointsMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStats" ADD CONSTRAINT "MatchStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
