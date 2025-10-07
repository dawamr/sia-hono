import { IRoleRepository } from '@core/ports/repositories/IRoleRepository';
import { RoleNotFoundException } from '@core/domain/exceptions/RoleExceptions';

export interface UpdateRoleDTO {
  roleId: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleResult {
  roleId: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  updatedAt: Date;
}

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: UpdateRoleDTO): Promise<UpdateRoleResult> {
    // Find existing role
    const role = await this.roleRepository.findById(dto.roleId);

    if (!role) {
      throw new RoleNotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    // Update details if provided
    if (dto.displayName !== undefined || dto.description !== undefined) {
      role.updateDetails({
        displayName: dto.displayName,
        description: dto.description,
      });
    }

    // Update permissions if provided
    if (dto.permissions !== undefined) {
      role.setPermissions(dto.permissions);
    }

    // Save updated role
    await this.roleRepository.save(role);

    return {
      roleId: role.getId(),
      name: role.getName(),
      displayName: role.getDisplayName(),
      description: role.getDescription() || undefined,
      permissions: role.getPermissions(),
      updatedAt: role.getUpdatedAt(),
    };
  }
}
