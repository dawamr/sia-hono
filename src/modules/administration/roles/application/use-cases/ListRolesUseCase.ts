import { Role } from '@core/domain/entities/Role';
import { IRoleRepository } from '@core/ports/repositories/IRoleRepository';

export interface ListRolesQuery {
  tenantId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RoleListItem {
  roleId: string;
  name: string;
  displayName: string;
  description?: string;
  permissionCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListRolesResult {
  roles: RoleListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(query: ListRolesQuery): Promise<ListRolesResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Get roles with filters
    const roles = await this.roleRepository.findAll({
      tenantId: query.tenantId,
      isActive: query.isActive,
      limit,
      offset,
    });

    // Filter by search if provided
    let filteredRoles = roles;
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredRoles = roles.filter(
        (role) =>
          role.getName().toLowerCase().includes(searchLower) ||
          role.getDisplayName().toLowerCase().includes(searchLower) ||
          role.getDescription()?.toLowerCase().includes(searchLower)
      );
    }

    // Count total (simplified - in real app, repository should handle this)
    const total = await this.roleRepository.count({
      tenantId: query.tenantId,
      isActive: query.isActive,
    });

    // Map to result
    const roleListItems: RoleListItem[] = filteredRoles.map((role) => ({
      roleId: role.getId(),
      name: role.getName(),
      displayName: role.getDisplayName(),
      description: role.getDescription(),
      permissionCount: role.getPermissions().length,
      isActive: role.isActive(),
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    }));

    return {
      roles: roleListItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
