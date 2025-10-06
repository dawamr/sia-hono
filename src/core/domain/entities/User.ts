import { Email } from '../value-objects/Email';

/**
 * User Entity
 * Represents a user in the system with business logic
 */
export class User {
  private constructor(
    private readonly id: string,
    private email: Email,
    private passwordHash: string,
    private firstName: string,
    private lastName: string,
    private phoneNumber: string | null,
    private avatar: string | null,
    private isActive: boolean,
    private isEmailVerified: boolean,
    private emailVerifiedAt: Date | null,
    private emailVerificationToken: string | null,
    private passwordResetToken: string | null,
    private passwordResetExpires: Date | null,
    private tenantId: string | null,
    private lastLoginAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null
  ) {}

  /**
   * Create a new User (for registration)
   */
  static create(props: {
    email: Email;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    tenantId?: string;
  }): User {
    const now = new Date();

    return new User(
      crypto.randomUUID(),
      props.email,
      props.passwordHash,
      props.firstName.trim(),
      props.lastName.trim(),
      props.phoneNumber?.trim() || null,
      null, // avatar
      true, // isActive
      false, // isEmailVerified
      null, // emailVerifiedAt
      crypto.randomUUID(), // emailVerificationToken
      null, // passwordResetToken
      null, // passwordResetExpires
      props.tenantId || null,
      null, // lastLoginAt
      now, // createdAt
      now, // updatedAt
      null // deletedAt
    );
  }

  /**
   * Reconstitute User from database
   */
  static reconstitute(props: {
    id: string;
    email: Email;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    avatar: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt: Date | null;
    emailVerificationToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;
    tenantId: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): User {
    return new User(
      props.id,
      props.email,
      props.passwordHash,
      props.firstName,
      props.lastName,
      props.phoneNumber,
      props.avatar,
      props.isActive,
      props.isEmailVerified,
      props.emailVerifiedAt,
      props.emailVerificationToken,
      props.passwordResetToken,
      props.passwordResetExpires,
      props.tenantId,
      props.lastLoginAt,
      props.createdAt,
      props.updatedAt,
      props.deletedAt
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): Email {
    return this.email;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  getPhoneNumber(): string | null {
    return this.phoneNumber;
  }

  getAvatar(): string | null {
    return this.avatar;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getIsEmailVerified(): boolean {
    return this.isEmailVerified;
  }

  getEmailVerifiedAt(): Date | null {
    return this.emailVerifiedAt;
  }

  getEmailVerificationToken(): string | null {
    return this.emailVerificationToken;
  }

  getPasswordResetToken(): string | null {
    return this.passwordResetToken;
  }

  getPasswordResetExpires(): Date | null {
    return this.passwordResetExpires;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  getLastLoginAt(): Date | null {
    return this.lastLoginAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  // Business methods

  /**
   * Update user profile
   */
  updateProfile(props: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatar?: string;
  }): void {
    if (props.firstName) {
      this.firstName = props.firstName.trim();
    }
    if (props.lastName) {
      this.lastName = props.lastName.trim();
    }
    if (props.phoneNumber !== undefined) {
      this.phoneNumber = props.phoneNumber?.trim() || null;
    }
    if (props.avatar !== undefined) {
      this.avatar = props.avatar || null;
    }
    this.touch();
  }

  /**
   * Change email
   */
  changeEmail(newEmail: Email): void {
    this.email = newEmail;
    this.isEmailVerified = false;
    this.emailVerificationToken = crypto.randomUUID();
    this.emailVerifiedAt = null;
    this.touch();
  }

  /**
   * Change password
   */
  changePassword(newPasswordHash: string): void {
    this.passwordHash = newPasswordHash;
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
    this.touch();
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): boolean {
    if (this.emailVerificationToken !== token) {
      return false;
    }

    this.isEmailVerified = true;
    this.emailVerifiedAt = new Date();
    this.emailVerificationToken = null;
    this.touch();
    return true;
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    const token = crypto.randomUUID();
    const expiresIn = 1000 * 60 * 60; // 1 hour
    
    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + expiresIn);
    this.touch();
    
    return token;
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token: string): boolean {
    if (!this.passwordResetToken || !this.passwordResetExpires) {
      return false;
    }

    if (this.passwordResetToken !== token) {
      return false;
    }

    if (this.passwordResetExpires < new Date()) {
      return false;
    }

    return true;
  }

  /**
   * Record login
   */
  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.touch();
  }

  /**
   * Activate user
   */
  activate(): void {
    this.isActive = true;
    this.touch();
  }

  /**
   * Deactivate user
   */
  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  /**
   * Soft delete user
   */
  delete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
    this.touch();
  }

  /**
   * Restore deleted user
   */
  restore(): void {
    this.deletedAt = null;
    this.isActive = true;
    this.touch();
  }

  /**
   * Check if user is deleted
   */
  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  /**
   * Check if user can login
   */
  canLogin(): boolean {
    return this.isActive && !this.isDeleted();
  }

  /**
   * Check if email verification is required
   */
  requiresEmailVerification(): boolean {
    return !this.isEmailVerified;
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
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    avatar: string | null;
    isActive: boolean;
    isEmailVerified: boolean;
    emailVerifiedAt: Date | null;
    emailVerificationToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;
    tenantId: string | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      passwordHash: this.passwordHash,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      avatar: this.avatar,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      emailVerifiedAt: this.emailVerifiedAt,
      emailVerificationToken: this.emailVerificationToken,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpires: this.passwordResetExpires,
      tenantId: this.tenantId,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
