import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

let prisma: PrismaClient;

/**
 * Get Prisma instance for tests
 */
export function getPrismaTestClient(): PrismaClient {
  if (!prisma) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    prisma = new PrismaClient({
      adapter,
    });
  }
  return prisma;
}

/**
 * Connect to test database
 */
export async function connectTestDatabase(): Promise<PrismaClient> {
  const client = getPrismaTestClient();
  await client.$connect();
  console.log("✅ Connected to test database");
  return client;
}

/**
 * Disconnect from test database
 */
export async function disconnectTestDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    console.log("✅ Disconnected from test database");
  }
  if (cleanupPool) {
    await cleanupPool.end();
    cleanupPool = null;
  }
}

// Pool partagé pour le nettoyage (évite de créer/fermer à chaque appel)
let cleanupPool: Pool | null = null;

function getCleanupPool(): Pool {
  if (!cleanupPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    cleanupPool = new Pool({ connectionString, max: 1 });
  }
  return cleanupPool;
}

const TRUNCATE_SQL = `
  DO $$
  DECLARE r RECORD;
  BEGIN
    -- Désactiver temporairement les contraintes pour éviter les deadlocks
    SET session_replication_role = 'replica';
    
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
      EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
    
    -- Réactiver les contraintes
    SET session_replication_role = 'origin';
  END $$;
`;

/**
 * Clean all tables (for test setup)
 * WARNING: Deletes ALL data!
 * Uses pg Pool directly because Prisma pg adapter may not support raw SQL / deleteMany.
 */
export async function cleanDatabase(): Promise<void> {
  const pool = getCleanupPool();
  try {
    await pool.query(TRUNCATE_SQL);
    console.log("🧹 Database cleaned");
  } catch (error) {
    // En cas d'erreur, réessayer une fois après un court délai
    await new Promise((resolve) => setTimeout(resolve, 100));
    await pool.query(TRUNCATE_SQL);
    console.log("🧹 Database cleaned");
  }
}

/**
 * Reset auto-increment IDs (optionnel)
 * Uses pg Pool directly (same as cleanDatabase).
 */
export async function resetSequences(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  try {
    await pool.query(TRUNCATE_SQL);
    console.log("🔄 Sequences reset");
  } finally {
    await pool.end();
  }
}

/**
 * Wrapper to run a test in a transaction (automatic rollback)
 * Useful for complete isolation without manual cleanup
 */
export async function runInTransaction<T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaTestClient();

  return client
    .$transaction(async (tx) => {
      await callback(tx as PrismaClient);
      // Throw to force rollback
      throw new Error("ROLLBACK_TRANSACTION");
    })
    .catch((error) => {
      if (error.message === "ROLLBACK_TRANSACTION") {
        // Transaction rollback successful
        return undefined as T;
      }
      throw error;
    });
}

