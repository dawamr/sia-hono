import type { User } from '@core/domain/entities/User';
import type { Email } from '@core/domain/value-objects/Email';
import type { UserRole } from '@shared/types';

/**
 * User filters for querying
 */
export interface UserFilters {
  tenantId?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  role?: UserRole;
  search?: string; // Search by name or email
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * User Repository Port
 * Interface for user persistence operations
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Find user by email verification token
   */
  findByEmailVerificationToken(token: string): Promise<User | null>;

  /**
   * Find user by password reset token
   */
  findByPasswordResetToken(token: string): Promise<User | null>;

  /**
   * Find all users with optional filters
   */
  findAll(filters?: UserFilters): Promise<User[]>;

  /**
   * Find users with pagination
   */
  findWithPagination(
    filters: UserFilters,
    page: number,
    limit: number
  ): Promise<{
    users: User[];
    total: number;
  }>;

  /**
   * Save user (create or update)
   */
  save(user: User): Promise<void>;

  /**
   * Delete user (hard delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if email exists
   */
  emailExists(email: Email, excludeUserId?: string): Promise<boolean>;

  /**
   * Count users with filters
   */
  count(filters?: UserFilters): Promise<number>;

  /**
   * Assign role to user
   */
  assignRole(userId: string, roleId: string, assignedBy?: string): Promise<void>;

  /**
   * Remove role from user
   */
  removeRole(userId: string, roleId: string): Promise<void>;

  /**
   * Get user roles
   */
  getUserRoles(userId: string): Promise<string[]>;

  /**
   * Check if user has role
   */
  hasRole(userId: string, roleId: string): Promise<boolean>;
}
