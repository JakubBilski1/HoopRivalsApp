-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('freethrows', 'threepointcontest');

-- CreateEnum
CREATE TYPE "FullMoney" AS ENUM ('leftCorner', 'rightCorner', 'topOfTheKey', 'leftWing', 'rightWing', 'leftMoney', 'rightMoney');

-- CreateTable
CREATE TABLE "Challenges" (
    "id" SERIAL NOT NULL,
    "challengeType" "ChallengeType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreeThrows" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "shotsMade" INTEGER NOT NULL,
    "shotsTaken" INTEGER NOT NULL,

    CONSTRAINT "FreeThrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreePointContest" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "leftCorner" INTEGER NOT NULL,
    "rightCorner" INTEGER NOT NULL,
    "topOfTheKey" INTEGER NOT NULL,
    "leftWing" INTEGER NOT NULL,
    "rightWing" INTEGER NOT NULL,
    "leftMoney" INTEGER NOT NULL,
    "rightMoney" INTEGER NOT NULL,
    "fullMoney" "FullMoney" NOT NULL,

    CONSTRAINT "ThreePointContest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Challenges" ADD CONSTRAINT "Challenges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeThrows" ADD CONSTRAINT "FreeThrows_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreePointContest" ADD CONSTRAINT "ThreePointContest_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
