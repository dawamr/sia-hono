import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  
  // Database
  DATABASE_URL: z.string(),
  TEST_DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  TEST_DB_NAME: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('52428800'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();
