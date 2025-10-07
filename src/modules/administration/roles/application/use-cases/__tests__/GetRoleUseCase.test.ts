import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetRoleUseCase } from '../GetRoleUseCase';
import { Role } from '@core/domain/entities/Role';
import { RoleNotFoundException } from '@core/domain/exceptions/RoleExceptions';
import type { IRoleRepository } from '@core/ports/repositories/IRoleRepository';

describe('GetRoleUseCase', () => {
  let useCase: GetRoleUseCase;
  let mockRepository: IRoleRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      existsByName: vi.fn(),
      findByUserId: vi.fn(),
    };

    useCase = new GetRoleUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should return role when found by ID', async () => {
      const role = Role.create({
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administrator',
        permissions: ['user:manage', 'system:manage'],
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(role);

      const result = await useCase.execute(role.getId());

      expect(result).toBeDefined();
      expect(result.roleId).toBe(role.getId());
      expect(result.name).toBe('admin');
      expect(result.displayName).toBe('Administrator');
      expect(result.description).toBe('System administrator');
      expect(result.permissions).toEqual(['user:manage', 'system:manage']);
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      expect(mockRepository.findById).toHaveBeenCalledWith(role.getId());
    });

    it('should return role without description when not provided', async () => {
      const role = Role.create({
        name: 'custom',
        displayName: 'Custom Role',
        permissions: [],
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(role);

      const result = await useCase.execute(role.getId());

      expect(result.description).toBeUndefined();
    });

    it('should return role without tenantId when not multi-tenant', async () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['student:read', 'assignment:manage'],
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(role);

      const result = await useCase.execute(role.getId());

      expect(result.tenantId).toBeUndefined();
    });

    it('should return role with tenantId in multi-tenant setup', async () => {
      const role = Role.create({
        name: 'tenant_admin',
        displayName: 'Tenant Admin',
        permissions: ['user:manage'],
        tenantId: 'tenant-123',
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(role);

      const result = await useCase.execute(role.getId());

      expect(result.tenantId).toBe('tenant-123');
    });

    it('should throw RoleNotFoundException when role not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      const nonExistentId = 'non-existent-id';

      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        RoleNotFoundException
      );
      await expect(useCase.execute(nonExistentId)).rejects.toThrow(
        `Role with ID ${nonExistentId} not found`
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
    });

    it('should return role with empty permissions array', async () => {
      const role = Role.create({
        name: 'viewer',
        displayName: 'Viewer',
        permissions: [],
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(role);

      const result = await useCase.execute(role.getId());

      expect(result.permissions).toEqual([]);
    });

    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.findById).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(useCase.execute('some-id')).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
});
