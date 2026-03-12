/*
  Warnings:

  - Added the required column `yjsState` to the `document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VIEWER', 'EDITOR', 'OWNER');

-- AlterTable
ALTER TABLE "document" ADD COLUMN     "yjsState" BYTEA NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Untitled Document';

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_id_key" ON "permission"("id");

-- CreateIndex
CREATE INDEX "permission_userId_idx" ON "permission"("userId");

-- CreateIndex
CREATE INDEX "permission_documentId_idx" ON "permission"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "permission_documentId_userId_key" ON "permission"("documentId", "userId");

-- CreateIndex
CREATE INDEX "document_ownerId_idx" ON "document"("ownerId");

-- Create or replace function for updating the updatedAt column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;  -- Ensure to return the modified row
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for all tables in the public schema
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename != '_prisma_migrations'
    LOOP
        -- Create or replace the trigger for each table
        EXECUTE format('
            CREATE OR REPLACE TRIGGER update_updated_at
            BEFORE INSERT OR UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
        ', tbl);
    END LOOP;
END $$;
