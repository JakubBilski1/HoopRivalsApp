/*
  Warnings:

  - You are about to drop the column `capacity` on the `Arena` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `QuarterStat` table. All the data in the column will be lost.
  - You are about to drop the column `redCard` on the `QuarterStat` table. All the data in the column will be lost.
  - You are about to drop the column `yellowCard` on the `QuarterStat` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `Arena` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `Arena` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `blocks` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `freeThrowsAttempted` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `freeThrowsScored` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePointsAttempted` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threePointsScored` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoPointsAttempted` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `twoPointsScored` to the `QuarterStat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Arena" DROP COLUMN "capacity",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ALTER COLUMN "location" SET NOT NULL;

-- AlterTable
ALTER TABLE "QuarterStat" DROP COLUMN "goals",
DROP COLUMN "redCard",
DROP COLUMN "yellowCard",
ADD COLUMN     "blocks" INTEGER NOT NULL,
ADD COLUMN     "freeThrowsAttempted" INTEGER NOT NULL,
ADD COLUMN     "freeThrowsScored" INTEGER NOT NULL,
ADD COLUMN     "rebounds" INTEGER,
ADD COLUMN     "threePointsAttempted" INTEGER NOT NULL,
ADD COLUMN     "threePointsScored" INTEGER NOT NULL,
ADD COLUMN     "twoPointsAttempted" INTEGER NOT NULL,
ADD COLUMN     "twoPointsScored" INTEGER NOT NULL,
ALTER COLUMN "assists" DROP NOT NULL,
ALTER COLUMN "assists" DROP DEFAULT;
