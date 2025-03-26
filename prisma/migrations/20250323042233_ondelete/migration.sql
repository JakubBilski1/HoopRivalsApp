-- DropForeignKey
ALTER TABLE "MatchStats" DROP CONSTRAINT "MatchStats_pointsMatchId_fkey";

-- DropForeignKey
ALTER TABLE "Quarter" DROP CONSTRAINT "Quarter_quarterMatchId_fkey";

-- DropForeignKey
ALTER TABLE "QuarterStat" DROP CONSTRAINT "QuarterStat_quarterId_fkey";

-- DropForeignKey
ALTER TABLE "TeamPlayer" DROP CONSTRAINT "TeamPlayer_teamId_fkey";

-- AddForeignKey
ALTER TABLE "Quarter" ADD CONSTRAINT "Quarter_quarterMatchId_fkey" FOREIGN KEY ("quarterMatchId") REFERENCES "QuarterMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuarterStat" ADD CONSTRAINT "QuarterStat_quarterId_fkey" FOREIGN KEY ("quarterId") REFERENCES "Quarter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchStats" ADD CONSTRAINT "MatchStats_pointsMatchId_fkey" FOREIGN KEY ("pointsMatchId") REFERENCES "PointsMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
