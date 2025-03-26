-- DropForeignKey
ALTER TABLE "FreeThrows" DROP CONSTRAINT "FreeThrows_challengeId_fkey";

-- AddForeignKey
ALTER TABLE "FreeThrows" ADD CONSTRAINT "FreeThrows_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
