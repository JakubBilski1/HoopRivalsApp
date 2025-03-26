-- CreateTable
CREATE TABLE "ChallengeBadges" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "badgeName" TEXT NOT NULL,
    "badgeColor" TEXT NOT NULL,
    "badgeIcon" TEXT NOT NULL,

    CONSTRAINT "ChallengeBadges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeBadges_challengeId_key" ON "ChallengeBadges"("challengeId");

-- AddForeignKey
ALTER TABLE "ChallengeBadges" ADD CONSTRAINT "ChallengeBadges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
