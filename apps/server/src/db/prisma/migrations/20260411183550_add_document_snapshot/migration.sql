-- AlterTable
ALTER TABLE "document" ADD CONSTRAINT "document_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "document_invitation" ADD CONSTRAINT "document_invitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "permission" ADD CONSTRAINT "permission_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "document_snapshot" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "documentId" TEXT NOT NULL,
    "yjsState" BYTEA NOT NULL,
    "creatorId" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_snapshot_id_key" ON "document_snapshot"("id");

-- CreateIndex
CREATE INDEX "document_snapshot_documentId_idx" ON "document_snapshot"("documentId");

-- AddForeignKey
ALTER TABLE "document_snapshot" ADD CONSTRAINT "document_snapshot_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_snapshot" ADD CONSTRAINT "document_snapshot_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;


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
