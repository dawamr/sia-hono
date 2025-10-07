import { pgTable, text, timestamp, uuid, boolean, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Roles table
 * Supports both predefined roles (super_admin, admin, etc.) and custom roles
 * Separated from users.schema.ts for better maintainability
 */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(), // Changed from enum to text to support custom roles
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  
  // Permissions (text array of permission strings)
  permissions: text('permissions').array().notNull().default(sql`'{}'::text[]`),
  
  // Multi-tenancy
  tenantId: uuid('tenant_id'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Export types (using RoleRow naming to avoid conflict with users.schema type exports)
export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;
