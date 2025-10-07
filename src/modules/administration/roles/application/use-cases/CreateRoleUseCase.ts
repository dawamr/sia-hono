import { Role } from '@core/domain/entities/Role';
import { IRoleRepository } from '@core/ports/repositories/IRoleRepository';
import { DuplicateRoleException } from '@core/domain/exceptions/RoleExceptions';

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  tenantId?: string;
}

export interface CreateRoleResult {
  roleId: string;
  name: string;
  displayName: string;
  permissions: string[];
  createdAt: Date;
}

export class CreateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: CreateRoleDTO): Promise<CreateRoleResult> {
    // Check if role with same name already exists
    const existingRole = await this.roleRepository.findByName(dto.name, dto.tenantId);
    
    if (existingRole) {
      throw new DuplicateRoleException(`Role with name ${dto.name} already exists`);
    }

    // Create role entity
    const role = Role.create({
      name: dto.name as any, // Will be validated by Zod
      displayName: dto.displayName,
      description: dto.description,
      permissions: dto.permissions || [],
      tenantId: dto.tenantId,
    });

    // Save to repository
    await this.roleRepository.save(role);

    // Return result
    return {
      roleId: role.getId(),
      name: role.getName(),
      displayName: role.getDisplayName(),
      permissions: role.getPermissions(),
      createdAt: role.getCreatedAt(),
    };
  }
}
