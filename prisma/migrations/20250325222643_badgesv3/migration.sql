/*
  Warnings:

  - Added the required column `badgeColor` to the `FreeThrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badgeIcon` to the `FreeThrows` table without a default value. This is not possible if the table is not empty.
  - Added the required column `badgeName` to the `FreeThrows` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FreeThrows" ADD COLUMN     "badgeColor" TEXT NOT NULL,
ADD COLUMN     "badgeIcon" TEXT NOT NULL,
ADD COLUMN     "badgeName" TEXT NOT NULL;
