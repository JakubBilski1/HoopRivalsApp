/*
  Warnings:

  - You are about to drop the `Arena` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_arenaId_fkey";

-- DropTable
DROP TABLE "Arena";

-- CreateTable
CREATE TABLE "arena" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "arena_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "arena_id_key" ON "arena"("id");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_arenaId_fkey" FOREIGN KEY ("arenaId") REFERENCES "arena"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
