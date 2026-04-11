-- CreateTable
CREATE TABLE "document_invitation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "document_invitation_id_key" ON "document_invitation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_active_document_invitations_index" ON "document_invitation"("email", "documentId") WHERE (("status" = 'PENDING' OR "status" = 'ACCEPTED') AND "revokedAt" IS NULL );

-- AddForeignKey
ALTER TABLE "document_invitation" ADD CONSTRAINT "document_invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_invitation" ADD CONSTRAINT "document_invitation_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


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
