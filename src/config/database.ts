import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

/**
 * Get database URL based on environment
 */
export const getDatabaseUrl = (): string => {
  if (env.NODE_ENV === 'test' && env.TEST_DATABASE_URL) {
    return env.TEST_DATABASE_URL;
  }
  return env.DATABASE_URL;
};

// Database connection
const connectionString = getDatabaseUrl();

export const sql = postgres(connectionString, {
  max: env.NODE_ENV === 'test' ? 5 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Drizzle instance
export const db = drizzle(sql);

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    await sql`SELECT 1`;
    console.log(`✅ Database connected successfully [${env.NODE_ENV}]`);
    console.log(`   Database: ${connectionString.split('@')[1] || 'hidden'}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Close database connection (useful for tests and seeders)
export const closeDatabaseConnection = async () => {
  try {
    await sql.end();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Failed to close database connection:', error);
  }
};
