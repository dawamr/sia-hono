import { IRoleRepository } from '@core/ports/repositories/IRoleRepository';
import { RoleNotFoundException } from '@core/domain/exceptions/RoleExceptions';

export interface DeleteRoleResult {
  roleId: string;
  name: string;
  deleted: boolean;
  deletedAt: Date;
}

export class DeleteRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: string): Promise<DeleteRoleResult> {
    // Find existing role
    const role = await this.roleRepository.findById(roleId);

    if (!role) {
      throw new RoleNotFoundException(`Role with ID ${roleId} not found`);
    }

    // Delete role
    await this.roleRepository.delete(roleId);

    return {
      roleId: role.getId(),
      name: role.getName(),
      deleted: true,
      deletedAt: new Date(),
    };
  }
}
