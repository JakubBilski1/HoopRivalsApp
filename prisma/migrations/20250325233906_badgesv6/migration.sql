/*
  Warnings:

  - You are about to drop the column `challengeId` on the `ChallengeBadge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChallengeBadge_challengeId_key";

-- AlterTable
ALTER TABLE "ChallengeBadge" DROP COLUMN "challengeId";
