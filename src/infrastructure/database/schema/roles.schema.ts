import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Roles table
 * Stores system roles with their metadata
 */
export const rolesTable = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // e.g., "super_admin", "admin", "teacher", "student"
  displayName: text('display_name').notNull(), // e.g., "Super Administrator"
  description: text('description'),
  permissions: text('permissions').array().notNull().default(sql`'{}'::text[]`), // Array of permission strings - PostgreSQL array syntax
  tenantId: uuid('tenant_id'), // For multi-tenancy support
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Use different type names to avoid conflict with users.schema.ts
export type RoleRow = typeof rolesTable.$inferSelect;
export type NewRoleRow = typeof rolesTable.$inferInsert;
