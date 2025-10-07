import { eq, and, sql } from 'drizzle-orm';
import { db } from '@config/database';
import { roles, userRoles } from '../schema';
import type { IRoleRepository, RoleFilters } from '@core/ports/repositories/IRoleRepository';
import { Role } from '@core/domain/entities/Role';

/**
 * Role Repository Implementation
 * Implements IRoleRepository using Drizzle ORM
 */
export class RoleRepository implements IRoleRepository {
  /**
   * Find role by ID
   */
  async findById(id: string): Promise<Role | null> {
    const result = await db.select().from(roles).where(eq(roles.id, id)).limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find role by name
   */
  async findByName(name: string, tenantId?: string): Promise<Role | null> {
    const conditions = [eq(roles.name, name)];

    if (tenantId) {
      conditions.push(eq(roles.tenantId, tenantId));
    }

    const result = await db.select().from(roles).where(and(...conditions)).limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find all roles with optional filters
   */
  async findAll(filters?: RoleFilters): Promise<Role[]> {
    const conditions = this.buildWhereConditions(filters);

    const result = await db
      .select()
      .from(roles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(roles.name);

    return result.map((row) => this.toDomain(row));
  }

  /**
   * Save role (create or update)
   */
  async save(role: Role): Promise<void> {
    const data = role.toPersistence();

    await db
      .insert(roles)
      .values({
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        permissions: data.permissions, // Direct array assignment, no JSON.stringify needed
        tenantId: data.tenantId,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: roles.id,
        set: {
          displayName: data.displayName,
          description: data.description,
          permissions: data.permissions, // Direct array assignment, no JSON.stringify needed
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
  }

  /**
   * Delete role
   */
  async delete(id: string): Promise<void> {
    // First, remove all user-role assignments
    await db.delete(userRoles).where(eq(userRoles.roleId, id));

    // Then delete the role
    await db.delete(roles).where(eq(roles.id, id));
  }

  /**
   * Check if role exists by name
   */
  async existsByName(
    name: string,
    tenantId?: string,
    excludeRoleId?: string
  ): Promise<boolean> {
    const conditions = [eq(roles.name, name)];

    if (tenantId) {
      conditions.push(eq(roles.tenantId, tenantId));
    }

    if (excludeRoleId) {
      conditions.push(sql`${roles.id} != ${excludeRoleId}`);
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(roles)
      .where(and(...conditions));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Count roles with filters
   */
  async count(filters?: RoleFilters): Promise<number> {
    const conditions = this.buildWhereConditions(filters);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(roles)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count || 0);
  }

  /**
   * Get roles by user ID
   */
  async findByUserId(userId: string): Promise<Role[]> {
    const result = await db
      .select({
        id: roles.id,
        name: roles.name,
        displayName: roles.displayName,
        description: roles.description,
        permissions: roles.permissions,
        tenantId: roles.tenantId,
        isActive: roles.isActive,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(roles)
      .innerJoin(userRoles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    return result.map((row) => this.toDomain(row));
  }

  /**
   * Build where conditions from filters
   */
  private buildWhereConditions(filters?: RoleFilters): Array<any> {
    const conditions: Array<any> = [];

    if (!filters) {
      return conditions;
    }

    if (filters.tenantId) {
      conditions.push(eq(roles.tenantId, filters.tenantId));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(roles.isActive, filters.isActive));
    }

    if (filters.name) {
      conditions.push(eq(roles.name, filters.name));
    }

    return conditions;
  }

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: typeof roles.$inferSelect): Role {
    // row.permissions is already string[] from PostgreSQL array type
    // No JSON.parse needed - Drizzle handles array conversion automatically
    const permissions = row.permissions;

    return Role.reconstitute({
      id: row.id,
      name: row.name as any, // Type assertion for custom role names
      displayName: row.displayName,
      description: row.description,
      permissions,
      tenantId: row.tenantId,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
