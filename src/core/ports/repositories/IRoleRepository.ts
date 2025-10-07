import type { Role } from '@core/domain/entities/Role';

/**
 * Role filters for querying
 */
export interface RoleFilters {
  tenantId?: string;
  isActive?: boolean;
  name?: string; // Changed from UserRole to support custom roles
}

/**
 * Role Repository Port
 * Interface for role persistence operations
 * Supports both predefined roles (super_admin, admin, etc.) and custom roles
 */
export interface IRoleRepository {
  /**
   * Find role by ID
   */
  findById(id: string): Promise<Role | null>;

  /**
   * Find role by name (supports both predefined and custom role names)
   */
  findByName(name: string, tenantId?: string): Promise<Role | null>;

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
   * Check if role exists by name (supports custom roles)
   */
  existsByName(name: string, tenantId?: string, excludeRoleId?: string): Promise<boolean>;

  /**
   * Count roles with filters
   */
  count(filters?: RoleFilters): Promise<number>;

  /**
   * Get roles by user ID
   */
  findByUserId(userId: string): Promise<Role[]>;
}
