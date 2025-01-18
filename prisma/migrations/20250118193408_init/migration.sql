/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `otp` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "otp" ALTER COLUMN "expires" SET DEFAULT now() + interval '2 minutes';

-- CreateIndex
CREATE UNIQUE INDEX "otp_user_id_key" ON "otp"("user_id");
