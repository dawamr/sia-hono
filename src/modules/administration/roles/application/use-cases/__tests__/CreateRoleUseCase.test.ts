import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateRoleUseCase } from '../CreateRoleUseCase';
import { Role } from '@core/domain/entities/Role';
import { DuplicateRoleException } from '@core/domain/exceptions/RoleExceptions';
import type { IRoleRepository } from '@core/ports/repositories/IRoleRepository';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let mockRepository: IRoleRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    };

    useCase = new CreateRoleUseCase(mockRepository);
  });

  describe('execute', () => {
    it('should create a new role successfully', async () => {
      const dto = {
        name: 'custom_role',
        displayName: 'Custom Role',
        description: 'A custom role for testing',
        permissions: ['user:read', 'student:read'],
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe('custom_role');
      expect(result.displayName).toBe('Custom Role');
      expect(result.permissions).toEqual(['user:read', 'student:read']);
      expect(result.roleId).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);

      expect(mockRepository.findByName).toHaveBeenCalledWith(
        'custom_role',
        undefined
      );
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create role without description', async () => {
      const dto = {
        name: 'minimal_role',
        displayName: 'Minimal Role',
        permissions: [],
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.name).toBe('minimal_role');
      expect(result.permissions).toEqual([]);
    });

    it('should create role with empty permissions array', async () => {
      const dto = {
        name: 'no_perm_role',
        displayName: 'No Permission Role',
        permissions: [],
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result.permissions).toEqual([]);
    });

    it('should create role with tenantId for multi-tenancy', async () => {
      const dto = {
        name: 'tenant_role',
        displayName: 'Tenant Role',
        permissions: ['user:read'],
        tenantId: 'tenant-123',
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(mockRepository.findByName).toHaveBeenCalledWith(
        'tenant_role',
        'tenant-123'
      );
    });

    it('should throw DuplicateRoleException when role name already exists', async () => {
      const dto = {
        name: 'existing_role',
        displayName: 'Existing Role',
        permissions: [],
      };

      const existingRole = Role.create({
        name: 'super_admin',
        displayName: 'Super Admin',
      });

      vi.mocked(mockRepository.findByName).mockResolvedValue(existingRole);

      await expect(useCase.execute(dto)).rejects.toThrow(
        DuplicateRoleException
      );
      await expect(useCase.execute(dto)).rejects.toThrow(
        'Role with name existing_role already exists'
      );

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create role with multiple permissions', async () => {
      const dto = {
        name: 'multi_perm_role',
        displayName: 'Multi Permission Role',
        permissions: [
          'user:read',
          'user:create',
          'student:read',
          'teacher:read',
          'class:manage',
        ],
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result.permissions).toHaveLength(5);
      expect(result.permissions).toContain('user:read');
      expect(result.permissions).toContain('class:manage');
    });

    it('should handle repository save errors', async () => {
      const dto = {
        name: 'error_role',
        displayName: 'Error Role',
        permissions: [],
      };

      vi.mocked(mockRepository.findByName).mockResolvedValue(null);
      vi.mocked(mockRepository.save).mockRejectedValue(
        new Error('Database error')
      );

      await expect(useCase.execute(dto)).rejects.toThrow('Database error');
    });
  });
});
