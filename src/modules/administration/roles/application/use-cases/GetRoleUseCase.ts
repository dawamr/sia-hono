import { IRoleRepository } from '@core/ports/repositories/IRoleRepository';
import { RoleNotFoundException } from '@core/domain/exceptions/RoleExceptions';

export interface GetRoleResult {
  roleId: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: string): Promise<GetRoleResult> {
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new RoleNotFoundException(`Role with ID ${roleId} not found`);
    }

    return {
      roleId: role.getId(),
      name: role.getName(),
      displayName: role.getDisplayName(),
      description: role.getDescription() || undefined,
      permissions: role.getPermissions(),
      isActive: role.getIsActive(),
      tenantId: role.getTenantId() || undefined,
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    };
  }
}
