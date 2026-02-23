import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve(import.meta.dirname, "../prisma/migrations");
const folders = fs.readdirSync(migrationsDir).filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());
const latestMigrationFile = path.join(migrationsDir, folders.sort().at(-1), 'migration.sql');

const marker = 'CREATE OR REPLACE FUNCTION set_updated_at()';
const triggerSQL = `
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
`;


const content = fs.readFileSync(latestMigrationFile, 'utf-8');

if (!content.includes(marker)) {
 fs.appendFileSync(latestMigrationFile, triggerSQL);
 console.log(`[SUCCESS] Trigger function "set_updated_at" appended to: ${latestMigrationFile}`);
} else {
 console.log(`[INFO] Trigger function "set_updated_at" already exists in ${latestMigrationFile}`)
}