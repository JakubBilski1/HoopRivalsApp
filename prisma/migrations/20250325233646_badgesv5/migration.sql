/*
  Warnings:

  - You are about to drop the `_ChallengeBadgeToChallenges` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[challengeBadgeId]` on the table `Challenges` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challengeBadgeId` to the `Challenges` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ChallengeBadgeToChallenges" DROP CONSTRAINT "_ChallengeBadgeToChallenges_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChallengeBadgeToChallenges" DROP CONSTRAINT "_ChallengeBadgeToChallenges_B_fkey";

-- AlterTable
ALTER TABLE "Challenges" ADD COLUMN     "challengeBadgeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ChallengeBadgeToChallenges";

-- CreateIndex
CREATE UNIQUE INDEX "Challenges_challengeBadgeId_key" ON "Challenges"("challengeBadgeId");

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_challengeBadgeId_fkey" FOREIGN KEY ("challengeBadgeId") REFERENCES "ChallengeBadge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
