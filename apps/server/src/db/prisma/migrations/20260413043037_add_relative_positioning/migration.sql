/*
  Warnings:

  - Added the required column `relFrom` to the `document_comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relTo` to the `document_comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_comment" ADD COLUMN     "relFrom" BYTEA NOT NULL,
ADD COLUMN     "relTo" BYTEA NOT NULL;


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
