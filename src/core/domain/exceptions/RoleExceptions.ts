/**
 * Role-specific domain exceptions
 */

export class RoleNotFoundException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoleNotFoundException';
  }
}

export class DuplicateRoleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateRoleException';
  }
}

export class InvalidRoleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRoleException';
  }
}

export class RoleInUseException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RoleInUseException';
  }
}
