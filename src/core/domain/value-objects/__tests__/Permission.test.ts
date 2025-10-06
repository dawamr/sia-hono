import { describe, it, expect } from 'vitest';
import { Permission } from '../Permission';

describe('Permission Value Object', () => {
  describe('create', () => {
    it('should create permission with resource and action', () => {
      const permission = Permission.create('user:create');

      expect(permission).toBeDefined();
      expect(permission.getResource()).toBe('user');
      expect(permission.getAction()).toBe('create');
      expect(permission.getScope()).toBeUndefined();
    });

    it('should create permission with resource, action, and scope', () => {
      const permission = Permission.create('grade:update:class_123');

      expect(permission).toBeDefined();
      expect(permission.getResource()).toBe('grade');
      expect(permission.getAction()).toBe('update');
      expect(permission.getScope()).toBe('class_123');
    });

    it('should create permission for all valid resources', () => {
      const resources = [
        'user',
        'role',
        'student',
        'teacher',
        'class',
        'subject',
        'assignment',
        'grade',
        'attendance',
        'schedule',
        'announcement',
        'report',
        'system',
      ];

      resources.forEach((resource) => {
        const permission = Permission.create(`${resource}:read`);
        expect(permission.getResource()).toBe(resource);
      });
    });

    it('should create permission for all valid actions', () => {
      const actions = ['create', 'read', 'update', 'delete', 'manage'];

      actions.forEach((action) => {
        const permission = Permission.create(`user:${action}`);
        expect(permission.getAction()).toBe(action);
      });
    });

    it('should throw error for invalid format (missing action)', () => {
      expect(() => Permission.create('user')).toThrow(
        'Invalid permission format'
      );
    });

    it('should throw error for invalid format (too many parts)', () => {
      expect(() => Permission.create('user:create:scope:extra')).toThrow(
        'Invalid permission format'
      );
    });

    it('should throw error for invalid resource', () => {
      expect(() => Permission.create('invalid:create')).toThrow(
        'Invalid permission resource: invalid'
      );
    });

    it('should throw error for invalid action', () => {
      expect(() => Permission.create('user:invalid')).toThrow(
        'Invalid permission action: invalid'
      );
    });

    it('should throw error for empty string', () => {
      expect(() => Permission.create('')).toThrow('Invalid permission format');
    });
  });

  describe('fromComponents', () => {
    it('should create permission from components without scope', () => {
      const permission = Permission.fromComponents('user', 'create');

      expect(permission.getResource()).toBe('user');
      expect(permission.getAction()).toBe('create');
      expect(permission.getScope()).toBeUndefined();
    });

    it('should create permission from components with scope', () => {
      const permission = Permission.fromComponents(
        'grade',
        'update',
        'class_123'
      );

      expect(permission.getResource()).toBe('grade');
      expect(permission.getAction()).toBe('update');
      expect(permission.getScope()).toBe('class_123');
    });
  });

  describe('toString', () => {
    it('should return string representation without scope', () => {
      const permission = Permission.create('user:create');

      expect(permission.toString()).toBe('user:create');
    });

    it('should return string representation with scope', () => {
      const permission = Permission.create('grade:update:class_123');

      expect(permission.toString()).toBe('grade:update:class_123');
    });
  });

  describe('matches', () => {
    it('should match exact same permission', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('user:create');

      expect(perm1.matches(perm2)).toBe(true);
    });

    it('should not match different resources', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('role:create');

      expect(perm1.matches(perm2)).toBe(false);
    });

    it('should not match different actions', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('user:read');

      expect(perm1.matches(perm2)).toBe(false);
    });

    it('should match manage action with any action on same resource', () => {
      const managePerm = Permission.create('user:manage');
      const createPerm = Permission.create('user:create');
      const readPerm = Permission.create('user:read');
      const updatePerm = Permission.create('user:update');
      const deletePerm = Permission.create('user:delete');

      expect(managePerm.matches(createPerm)).toBe(true);
      expect(managePerm.matches(readPerm)).toBe(true);
      expect(managePerm.matches(updatePerm)).toBe(true);
      expect(managePerm.matches(deletePerm)).toBe(true);
    });

    it('should not match manage action across different resources', () => {
      const userManage = Permission.create('user:manage');
      const roleCreate = Permission.create('role:create');

      expect(userManage.matches(roleCreate)).toBe(false);
    });

    it('should match when current has no scope and required has scope', () => {
      const globalPerm = Permission.create('grade:update');
      const scopedPerm = Permission.create('grade:update:class_123');

      expect(globalPerm.matches(scopedPerm)).toBe(true);
    });

    it('should match when both have same scope', () => {
      const perm1 = Permission.create('grade:update:class_123');
      const perm2 = Permission.create('grade:update:class_123');

      expect(perm1.matches(perm2)).toBe(true);
    });

    it('should not match when scopes are different', () => {
      const perm1 = Permission.create('grade:update:class_123');
      const perm2 = Permission.create('grade:update:class_456');

      expect(perm1.matches(perm2)).toBe(false);
    });

    it('should match when required has no scope', () => {
      const scopedPerm = Permission.create('grade:update:class_123');
      const globalPerm = Permission.create('grade:update');

      expect(scopedPerm.matches(globalPerm)).toBe(true);
    });
  });

  describe('implies', () => {
    it('should work same as matches', () => {
      const perm1 = Permission.create('user:manage');
      const perm2 = Permission.create('user:create');

      expect(perm1.implies(perm2)).toBe(perm1.matches(perm2));
      expect(perm1.implies(perm2)).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for identical permissions', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('user:create');

      expect(perm1.equals(perm2)).toBe(true);
    });

    it('should return true for identical permissions with scope', () => {
      const perm1 = Permission.create('grade:update:class_123');
      const perm2 = Permission.create('grade:update:class_123');

      expect(perm1.equals(perm2)).toBe(true);
    });

    it('should return false for different resources', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('role:create');

      expect(perm1.equals(perm2)).toBe(false);
    });

    it('should return false for different actions', () => {
      const perm1 = Permission.create('user:create');
      const perm2 = Permission.create('user:read');

      expect(perm1.equals(perm2)).toBe(false);
    });

    it('should return false for different scopes', () => {
      const perm1 = Permission.create('grade:update:class_123');
      const perm2 = Permission.create('grade:update:class_456');

      expect(perm1.equals(perm2)).toBe(false);
    });

    it('should return false when one has scope and other does not', () => {
      const perm1 = Permission.create('grade:update');
      const perm2 = Permission.create('grade:update:class_123');

      expect(perm1.equals(perm2)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle system:manage permission', () => {
      const permission = Permission.create('system:manage');

      expect(permission.getResource()).toBe('system');
      expect(permission.getAction()).toBe('manage');
    });

    it('should handle all resource types with manage action', () => {
      const resources = [
        'user',
        'role',
        'student',
        'teacher',
        'class',
        'subject',
        'assignment',
        'grade',
        'attendance',
        'schedule',
        'announcement',
        'report',
        'system',
      ];

      resources.forEach((resource) => {
        const permission = Permission.create(`${resource}:manage`);
        expect(permission.getAction()).toBe('manage');
      });
    });
  });
});
