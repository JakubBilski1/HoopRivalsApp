/*
  Warnings:

  - A unique constraint covering the columns `[challengeId]` on the table `FreeThrows` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challengeId]` on the table `ThreePointContest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FreeThrows_challengeId_key" ON "FreeThrows"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "ThreePointContest_challengeId_key" ON "ThreePointContest"("challengeId");
