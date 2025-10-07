import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * User role enum
 */
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin',
  'teacher',
  'student',
  'parent',
]);

/**
 * Users table
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  
  // Profile information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }),
  avatar: text('avatar'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  emailVerifiedAt: timestamp('email_verified_at'),
  
  // Verification tokens
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  
  // Multi-tenancy
  tenantId: uuid('tenant_id'),
  
  // Timestamps
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

/**
 * Roles table
 */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: userRoleEnum('name').notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  description: text('description'),
  
  // Permissions (JSON array of permission strings)
  permissions: text('permissions').notNull().default('[]'),
  
  // Multi-tenancy
  tenantId: uuid('tenant_id'),
  
  // Status
  isActive: boolean('is_active').notNull().default(true),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * User-Role junction table (many-to-many)
 */
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  
  // Assignment metadata
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  
  // Multi-tenancy
  tenantId: uuid('tenant_id'),
});

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
  }),
}));

/**
 * Type exports
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
