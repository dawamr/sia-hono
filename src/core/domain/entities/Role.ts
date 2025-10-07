/**
 * Role Entity
 * Represents a user role with permissions
 * Supports both predefined roles (admin, teacher, etc.) and custom roles
 */
export class Role {
  private constructor(
    private readonly id: string,
    private name: string,
    private displayName: string,
    private description: string | null,
    private permissions: string[],
    private tenantId: string | null,
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  /**
   * Create a new Role
   */
  static create(props: {
    name: string;
    displayName: string;
    description?: string;
    permissions?: string[];
    tenantId?: string;
  }): Role {
    const now = new Date();

    return new Role(
      crypto.randomUUID(),
      props.name,
      props.displayName.trim(),
      props.description?.trim() || null,
      props.permissions || [],
      props.tenantId || null,
      true, // isActive
      now, // createdAt
      now // updatedAt
    );
  }

  /**
   * Reconstitute Role from database
   */
  static reconstitute(props: {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    permissions: string[];
    tenantId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Role {
    return new Role(
      props.id,
      props.name,
      props.displayName,
      props.description,
      props.permissions,
      props.tenantId,
      props.isActive,
      props.createdAt,
      props.updatedAt
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getDescription(): string | null {
    return this.description;
  }

  getPermissions(): string[] {
    return [...this.permissions]; // Return copy to prevent mutation
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods

  /**
   * Update role details
   */
  updateDetails(props: {
    displayName?: string;
    description?: string;
  }): void {
    if (props.displayName) {
      this.displayName = props.displayName.trim();
    }
    if (props.description !== undefined) {
      this.description = props.description?.trim() || null;
    }
    this.touch();
  }

  /**
   * Add permission
   */
  addPermission(permission: string): void {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      this.touch();
    }
  }

  /**
   * Remove permission
   */
  removePermission(permission: string): void {
    const index = this.permissions.indexOf(permission);
    if (index > -1) {
      this.permissions.splice(index, 1);
      this.touch();
    }
  }

  /**
   * Set permissions (replace all)
   */
  setPermissions(permissions: string[]): void {
    this.permissions = [...permissions];
    this.touch();
  }

  /**
   * Check if role has permission
   */
  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Check if role has any of the permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.permissions.includes(p));
  }

  /**
   * Check if role has all permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.permissions.includes(p));
  }

  /**
   * Activate role
   */
  activate(): void {
    this.isActive = true;
    this.touch();
  }

  /**
   * Deactivate role
   */
  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  /**
   * Update timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }

  /**
   * Convert to plain object (for persistence)
   */
  toPersistence(): {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    permissions: string[];
    tenantId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      permissions: this.permissions,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
