import { eq, and, or, like, isNull, gte, lte, sql } from 'drizzle-orm';
import { db } from '@config/database';
import { users, userRoles } from '../schema';
import type { IUserRepository, UserFilters } from '@core/ports/repositories/IUserRepository';
import { User } from '@core/domain/entities/User';
import { Email } from '@core/domain/value-objects/Email';

/**
 * User Repository Implementation
 * Implements IUserRepository using Drizzle ORM
 */
export class UserRepository implements IUserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: Email): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email.getValue()), isNull(users.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.emailVerificationToken, token), isNull(users.deletedAt)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find user by password reset token
   */
  async findByPasswordResetToken(token: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gte(users.passwordResetExpires, new Date()),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters?: UserFilters): Promise<User[]> {
    const conditions = this.buildWhereConditions(filters);

    const result = await db.select().from(users).where(and(...conditions));

    return result.map((row) => this.toDomain(row));
  }

  /**
   * Find users with pagination
   */
  async findWithPagination(
    filters: UserFilters,
    page: number,
    limit: number
  ): Promise<{
    users: User[];
    total: number;
  }> {
    const conditions = this.buildWhereConditions(filters);
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    // Get paginated results
    const result = await db
      .select()
      .from(users)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(users.createdAt);

    const userEntities = result.map((row) => this.toDomain(row));

    return {
      users: userEntities,
      total,
    };
  }

  /**
   * Save user (create or update)
   */
  async save(user: User): Promise<void> {
    const data = user.toPersistence();

    await db
      .insert(users)
      .values({
        id: data.id,
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        avatar: data.avatar,
        isActive: data.isActive,
        isEmailVerified: data.isEmailVerified,
        emailVerifiedAt: data.emailVerifiedAt,
        emailVerificationToken: data.emailVerificationToken,
        passwordResetToken: data.passwordResetToken,
        passwordResetExpires: data.passwordResetExpires,
        tenantId: data.tenantId,
        lastLoginAt: data.lastLoginAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        deletedAt: data.deletedAt,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: data.email,
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
          isActive: data.isActive,
          isEmailVerified: data.isEmailVerified,
          emailVerifiedAt: data.emailVerifiedAt,
          emailVerificationToken: data.emailVerificationToken,
          passwordResetToken: data.passwordResetToken,
          passwordResetExpires: data.passwordResetExpires,
          lastLoginAt: data.lastLoginAt,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
        },
      });
  }

  /**
   * Delete user (hard delete)
   */
  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Check if email exists
   */
  async emailExists(email: Email, excludeUserId?: string): Promise<boolean> {
    const conditions = [eq(users.email, email.getValue()), isNull(users.deletedAt)];

    if (excludeUserId) {
      conditions.push(sql`${users.id} != ${excludeUserId}`);
    }

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Count users with filters
   */
  async count(filters?: UserFilters): Promise<number> {
    const conditions = this.buildWhereConditions(filters);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(...conditions));

    return Number(result[0]?.count || 0);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string, assignedBy?: string): Promise<void> {
    await db.insert(userRoles).values({
      userId,
      roleId,
      assignedBy: assignedBy || null,
      assignedAt: new Date(),
    });
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
  }

  /**
   * Get user roles (returns role IDs)
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const result = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    return result.map((row) => row.roleId);
  }

  /**
   * Check if user has role
   */
  async hasRole(userId: string, roleId: string): Promise<boolean> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

    return Number(result[0]?.count || 0) > 0;
  }

  /**
   * Build where conditions from filters
   */
  private buildWhereConditions(filters?: UserFilters) {
    const conditions = [isNull(users.deletedAt)];

    if (!filters) {
      return conditions;
    }

    if (filters.tenantId) {
      conditions.push(eq(users.tenantId, filters.tenantId));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(users.isActive, filters.isActive));
    }

    if (filters.isEmailVerified !== undefined) {
      conditions.push(eq(users.isEmailVerified, filters.isEmailVerified));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(users.email, searchTerm),
          like(users.firstName, searchTerm),
          like(users.lastName, searchTerm)
        )!
      );
    }

    if (filters.createdAfter) {
      conditions.push(gte(users.createdAt, filters.createdAfter));
    }

    if (filters.createdBefore) {
      conditions.push(lte(users.createdAt, filters.createdBefore));
    }

    return conditions;
  }

  /**
   * Convert database row to domain entity
   */
  private toDomain(row: typeof users.$inferSelect): User {
    return User.reconstitute({
      id: row.id,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      phoneNumber: row.phoneNumber,
      avatar: row.avatar,
      isActive: row.isActive,
      isEmailVerified: row.isEmailVerified,
      emailVerifiedAt: row.emailVerifiedAt,
      emailVerificationToken: row.emailVerificationToken,
      passwordResetToken: row.passwordResetToken,
      passwordResetExpires: row.passwordResetExpires,
      tenantId: row.tenantId,
      lastLoginAt: row.lastLoginAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    });
  }
}
