import type { Role } from '@core/domain/entities/Role';
import type { UserRole } from '@shared/types';

/**
 * Role filters for querying
 */
export interface RoleFilters {
  tenantId?: string;
  isActive?: boolean;
  name?: UserRole;
}

/**
 * Role Repository Port
 * Interface for role persistence operations
 */
export interface IRoleRepository {
  /**
   * Find role by ID
   */
  findById(id: string): Promise<Role | null>;

  /**
   * Find role by name
   */
  findByName(name: UserRole, tenantId?: string): Promise<Role | null>;

  /**
   * Find all roles with optional filters
   */
  findAll(filters?: RoleFilters): Promise<Role[]>;

  /**
   * Save role (create or update)
   */
  save(role: Role): Promise<void>;

  /**
   * Delete role
   */
  delete(id: string): Promise<void>;

  /**
   * Check if role exists by name
   */
  existsByName(name: UserRole, tenantId?: string, excludeRoleId?: string): Promise<boolean>;

  /**
   * Count roles with filters
   */
  count(filters?: RoleFilters): Promise<number>;

  /**
   * Get roles by user ID
   */
  findByUserId(userId: string): Promise<Role[]>;
}
