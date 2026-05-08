-- This is an empty migration.

ALTER TABLE document ENABLE ROW LEVEL SECURITY;
ALTER TABLE document FORCE ROW LEVEL SECURITY;

CREATE POLICY no_select_deleted
 ON document
 FOR SELECT
 USING (
    ("deletedAt" IS NULL
    AND "permanentlyDeletedAt" IS NULL)
    OR current_setting('app.showDeleted', true) = 'true'
 );

 CREATE POLICY no_update_deleted
 on document
 FOR UPDATE
 USING (("deletedAt" IS NULL AND "permanentlyDeletedAt" IS NULL) OR current_setting('app.showDeleted', true) = 'true');


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
