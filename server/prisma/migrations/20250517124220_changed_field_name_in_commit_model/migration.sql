/*
  Warnings:

  - You are about to drop the column `commitData` on the `Commit` table. All the data in the column will be lost.
  - Added the required column `commitDate` to the `Commit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commit" DROP COLUMN "commitData",
ADD COLUMN     "commitDate" TIMESTAMP(3) NOT NULL;
