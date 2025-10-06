/**
 * Base domain exception
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * User not found exception
 */
export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}

/**
 * User already exists exception
 */
export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

/**
 * Invalid credentials exception
 */
export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password');
  }
}

/**
 * Email not verified exception
 */
export class EmailNotVerifiedException extends DomainException {
  constructor() {
    super('Email address has not been verified');
  }
}

/**
 * User inactive exception
 */
export class UserInactiveException extends DomainException {
  constructor() {
    super('User account is inactive');
  }
}

/**
 * Invalid verification token exception
 */
export class InvalidVerificationTokenException extends DomainException {
  constructor() {
    super('Invalid or expired verification token');
  }
}

/**
 * Invalid password reset token exception
 */
export class InvalidPasswordResetTokenException extends DomainException {
  constructor() {
    super('Invalid or expired password reset token');
  }
}

/**
 * Role not found exception
 */
export class RoleNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`Role not found: ${identifier}`);
  }
}

/**
 * Insufficient permissions exception
 */
export class InsufficientPermissionsException extends DomainException {
  constructor(requiredPermission: string) {
    super(`Insufficient permissions. Required: ${requiredPermission}`);
  }
}

/**
 * Invalid role assignment exception
 */
export class InvalidRoleAssignmentException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
