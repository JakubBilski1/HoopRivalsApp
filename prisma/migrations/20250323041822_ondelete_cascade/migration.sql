-- DropForeignKey
ALTER TABLE "PointsMatch" DROP CONSTRAINT "PointsMatch_matchId_fkey";

-- DropForeignKey
ALTER TABLE "QuarterMatch" DROP CONSTRAINT "QuarterMatch_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_matchId_fkey";

-- AddForeignKey
ALTER TABLE "QuarterMatch" ADD CONSTRAINT "QuarterMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsMatch" ADD CONSTRAINT "PointsMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
