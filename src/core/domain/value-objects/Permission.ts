/**
 * Permission Value Object
 * Represents a granular permission in the system
 */

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type PermissionResource =
  | 'user'
  | 'role'
  | 'student'
  | 'teacher'
  | 'class'
  | 'subject'
  | 'assignment'
  | 'grade'
  | 'attendance'
  | 'schedule'
  | 'announcement'
  | 'report'
  | 'system';

export class Permission {
  private constructor(
    private readonly resource: PermissionResource,
    private readonly action: PermissionAction,
    private readonly scope?: string
  ) {}

  /**
   * Create a new Permission
   * Format: resource:action or resource:action:scope
   */
  static create(permissionString: string): Permission {
    const parts = permissionString.split(':');

    if (parts.length < 2 || parts.length > 3) {
      throw new Error(
        'Invalid permission format. Expected "resource:action" or "resource:action:scope"'
      );
    }

    const [resource, action, scope] = parts;

    // Validate resource
    if (!this.isValidResource(resource)) {
      throw new Error(`Invalid permission resource: ${resource}`);
    }

    // Validate action
    if (!this.isValidAction(action)) {
      throw new Error(`Invalid permission action: ${action}`);
    }

    return new Permission(
      resource as PermissionResource,
      action as PermissionAction,
      scope
    );
  }

  /**
   * Create permission from components
   */
  static fromComponents(
    resource: PermissionResource,
    action: PermissionAction,
    scope?: string
  ): Permission {
    return new Permission(resource, action, scope);
  }

  private static isValidResource(resource: string): boolean {
    const validResources: PermissionResource[] = [
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
    return validResources.includes(resource as PermissionResource);
  }

  private static isValidAction(action: string): boolean {
    const validActions: PermissionAction[] = [
      'create',
      'read',
      'update',
      'delete',
      'manage',
    ];
    return validActions.includes(action as PermissionAction);
  }

  /**
   * Get string representation
   * Format: resource:action or resource:action:scope
   */
  toString(): string {
    if (this.scope) {
      return `${this.resource}:${this.action}:${this.scope}`;
    }
    return `${this.resource}:${this.action}`;
  }

  /**
   * Check if this permission matches another permission
   * Supports wildcard matching with "manage" action
   */
  matches(required: Permission): boolean {
    // Resource must match exactly
    if (this.resource !== required.resource) {
      return false;
    }

    // "manage" action grants all actions on the resource
    if (this.action === 'manage') {
      return true;
    }

    // Action must match
    if (this.action !== required.action) {
      return false;
    }

    // If required has scope, current must match or have no scope (global)
    if (required.scope) {
      return !this.scope || this.scope === required.scope;
    }

    return true;
  }

  /**
   * Check if this permission implies another permission
   * (same as matches but more semantic)
   */
  implies(other: Permission): boolean {
    return this.matches(other);
  }

  // Getters
  getResource(): PermissionResource {
    return this.resource;
  }

  getAction(): PermissionAction {
    return this.action;
  }

  getScope(): string | undefined {
    return this.scope;
  }

  // Equality
  equals(other: Permission): boolean {
    return (
      this.resource === other.resource &&
      this.action === other.action &&
      this.scope === other.scope
    );
  }
}
