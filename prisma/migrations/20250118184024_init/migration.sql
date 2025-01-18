-- AlterTable
ALTER TABLE "otp" ALTER COLUMN "expires" SET DEFAULT now() + interval '2 minutes';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "refresh_token" DROP NOT NULL;
