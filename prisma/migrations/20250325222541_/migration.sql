/*
  Warnings:

  - You are about to drop the `ChallengeBadge` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChallengeBadge" DROP CONSTRAINT "ChallengeBadge_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "FreeThrows" DROP CONSTRAINT "FreeThrows_challengeId_fkey";

-- DropTable
DROP TABLE "ChallengeBadge";

-- AddForeignKey
ALTER TABLE "FreeThrows" ADD CONSTRAINT "FreeThrows_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
