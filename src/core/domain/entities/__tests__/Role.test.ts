import { describe, it, expect } from 'vitest';
import { Role } from '../Role';

describe('Role Entity', () => {
  describe('create', () => {
    it('should create a new role', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        description: 'Teacher role',
        permissions: ['read:students', 'write:grades'],
      });

      expect(role.getId()).toBeTruthy();
      expect(role.getName()).toBe('teacher');
      expect(role.getDisplayName()).toBe('Teacher');
      expect(role.getDescription()).toBe('Teacher role');
      expect(role.getPermissions()).toEqual(['read:students', 'write:grades']);
      expect(role.getIsActive()).toBe(true);
    });

    it('should create role without permissions', () => {
      const role = Role.create({
        name: 'student',
        displayName: 'Student',
      });

      expect(role.getPermissions()).toEqual([]);
    });

    it('should create role with tenant ID', () => {
      const tenantId = 'tenant-123';
      const role = Role.create({
        name: 'admin',
        displayName: 'Admin',
        tenantId,
      });

      expect(role.getTenantId()).toBe(tenantId);
    });
  });

  describe('addPermission', () => {
    it('should add new permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.addPermission('read:students');
      expect(role.hasPermission('read:students')).toBe(true);
      expect(role.getPermissions()).toContain('read:students');
    });

    it('should not add duplicate permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      role.addPermission('read:students');
      const permissions = role.getPermissions();
      const count = permissions.filter((p) => p === 'read:students').length;

      expect(count).toBe(1);
    });

    it('should add multiple different permissions', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.addPermission('read:students');
      role.addPermission('write:grades');
      role.addPermission('delete:assignments');

      expect(role.getPermissions()).toHaveLength(3);
      expect(role.hasPermission('read:students')).toBe(true);
      expect(role.hasPermission('write:grades')).toBe(true);
      expect(role.hasPermission('delete:assignments')).toBe(true);
    });
  });

  describe('removePermission', () => {
    it('should remove existing permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      role.removePermission('read:students');

      expect(role.hasPermission('read:students')).toBe(false);
      expect(role.hasPermission('write:grades')).toBe(true);
      expect(role.getPermissions()).toHaveLength(1);
    });

    it('should do nothing when removing non-existent permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      role.removePermission('non:existent');

      expect(role.getPermissions()).toHaveLength(1);
      expect(role.hasPermission('read:students')).toBe(true);
    });

    it('should handle removing permission from list with duplicates', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      // Manually add duplicate (if implementation allows)
      role.addPermission('read:students');
      role.removePermission('read:students');

      // Should remove at least one instance
      const remaining = role.getPermissions().filter(p => p === 'read:students').length;
      expect(remaining).toBeLessThanOrEqual(1);
    });
  });

  describe('hasPermission', () => {
    it('should return true for existing permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      expect(role.hasPermission('read:students')).toBe(true);
      expect(role.hasPermission('write:grades')).toBe(true);
    });

    it('should return false for non-existing permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      expect(role.hasPermission('delete:students')).toBe(false);
    });

    it('should be case sensitive', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      expect(role.hasPermission('READ:STUDENTS')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if has at least one permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      expect(role.hasAnyPermission(['read:students', 'delete:students'])).toBe(true);
    });

    it('should return false if has none of the permissions', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      expect(role.hasAnyPermission(['write:students', 'delete:students'])).toBe(false);
    });

    it('should return true if has all permissions', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades', 'delete:assignments'],
      });

      expect(role.hasAnyPermission(['read:students', 'write:grades'])).toBe(true);
    });

    it('should return false for empty permissions check', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      expect(role.hasAnyPermission([])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if has all required permissions', () => {
      const role = Role.create({
        name: 'admin',
        displayName: 'Admin',
        permissions: ['read:students', 'write:grades', 'delete:students'],
      });

      expect(role.hasAllPermissions(['read:students', 'write:grades'])).toBe(true);
    });

    it('should return false if missing any required permission', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      expect(role.hasAllPermissions(['read:students', 'delete:students'])).toBe(false);
    });

    it('should return true for empty permissions check', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students'],
      });

      expect(role.hasAllPermissions([])).toBe(true);
    });

    it('should return false if role has no permissions', () => {
      const role = Role.create({
        name: 'student',
        displayName: 'Student',
      });

      expect(role.hasAllPermissions(['read:students'])).toBe(false);
    });
  });

  describe('setPermissions', () => {
    it('should replace all permissions', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      role.setPermissions(['delete:assignments', 'create:exams']);

      expect(role.getPermissions()).toEqual(['delete:assignments', 'create:exams']);
      expect(role.hasPermission('read:students')).toBe(false);
      expect(role.hasPermission('write:grades')).toBe(false);
    });

    it('should clear all permissions when given empty array', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        permissions: ['read:students', 'write:grades'],
      });

      role.setPermissions([]);

      expect(role.getPermissions()).toEqual([]);
      expect(role.hasPermission('read:students')).toBe(false);
    });
  });

  describe('updateDetails', () => {
    it('should update display name', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.updateDetails({ displayName: 'Senior Teacher' });

      expect(role.getDisplayName()).toBe('Senior Teacher');
    });

    it('should update description', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.updateDetails({ description: 'Updated description' });

      expect(role.getDescription()).toBe('Updated description');
    });

    it('should update multiple fields', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.updateDetails({
        displayName: 'Senior Teacher',
        description: 'Experienced teacher',
      });

      expect(role.getDisplayName()).toBe('Senior Teacher');
      expect(role.getDescription()).toBe('Experienced teacher');
    });
  });

  describe('activate and deactivate', () => {
    it('should activate inactive role', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      role.deactivate();
      expect(role.getIsActive()).toBe(false);

      role.activate();
      expect(role.getIsActive()).toBe(true);
    });

    it('should deactivate active role', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
      });

      expect(role.getIsActive()).toBe(true);

      role.deactivate();
      expect(role.getIsActive()).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute role from persistence data', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        description: 'Teacher role',
        permissions: ['read:students', 'write:grades'],
      });

      const persistence = role.toPersistence();
      const reconstituted = Role.reconstitute(persistence);

      expect(reconstituted.getId()).toBe(role.getId());
      expect(reconstituted.getName()).toBe(role.getName());
      expect(reconstituted.getDisplayName()).toBe(role.getDisplayName());
      expect(reconstituted.getDescription()).toBe(role.getDescription());
      expect(reconstituted.getPermissions()).toEqual(role.getPermissions());
    });
  });

  describe('role name enum', () => {
    it('should accept valid role names', () => {
      const validRoles = ['super_admin', 'admin', 'teacher', 'student', 'parent'];

      validRoles.forEach((name: any) => {
        const role = Role.create({
          name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1),
        });

        expect(role.getName()).toBe(name);
      });
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', () => {
      const role = Role.create({
        name: 'teacher',
        displayName: 'Teacher',
        description: 'Teacher role',
        permissions: ['read:students', 'write:grades'],
        tenantId: 'tenant-123',
      });

      const persistence = role.toPersistence();

      expect(persistence).toHaveProperty('id');
      expect(persistence).toHaveProperty('name', 'teacher');
      expect(persistence).toHaveProperty('displayName', 'Teacher');
      expect(persistence).toHaveProperty('description', 'Teacher role');
      expect(persistence).toHaveProperty('permissions');
      expect(persistence.permissions).toEqual(['read:students', 'write:grades']);
      expect(persistence).toHaveProperty('tenantId', 'tenant-123');
      expect(persistence).toHaveProperty('isActive', true);
      expect(persistence).toHaveProperty('createdAt');
      expect(persistence).toHaveProperty('updatedAt');
    });
  });
});
