/**
 * Email Value Object
 * Immutable value object representing a valid email address
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email.toLowerCase().trim();
  }

  /**
   * Create Email from string
   * @throws Error if email is invalid
   */
  static create(email: string): Email {
    if (!email || typeof email !== 'string') {
      throw new Error('Email cannot be empty');
    }

    const trimmedEmail = email.trim();

    if (!this.isValid(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    if (trimmedEmail.length > 255) {
      throw new Error('Email is too long (max 255 characters)');
    }

    return new Email(trimmedEmail);
  }

  /**
   * Validate email format
   */
  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get email value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Get email domain
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Get email local part (before @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }

  /**
   * Check if emails are equal
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Convert to string
   */
  toString(): string {
    return this.value;
  }
}
