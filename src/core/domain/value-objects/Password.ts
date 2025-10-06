/**
 * Password Value Object
 * Represents a password with validation rules
 * Note: This holds the plain password temporarily for validation.
 * The actual storage uses hashed passwords.
 */
export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  /**
   * Create Password from plain text
   * @throws Error if password doesn't meet requirements
   */
  static create(password: string): Password {
    if (!password || typeof password !== 'string') {
      throw new Error('Password cannot be empty');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 100) {
      throw new Error('Password is too long');
    }

    // Check each requirement individually for specific error messages
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    return new Password(password);
  }

  /**
   * Create Password without validation (for already validated passwords)
   * Use with caution - only for cases where password was already validated
   */
  static createWithoutValidation(password: string): Password {
    return new Password(password);
  }

  /**
   * Get password value (use carefully, only for hashing)
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check password strength level
   */
  getStrengthLevel(): 'weak' | 'medium' | 'strong' {
    if (this.value.length < 12) {
      return 'weak';
    }

    const hasMultipleNumbers = (this.value.match(/[0-9]/g) || []).length >= 2;
    const hasMultipleSpecialChars = (this.value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length >= 2;

    if (this.value.length >= 16 && hasMultipleNumbers && hasMultipleSpecialChars) {
      return 'strong';
    }

    return 'medium';
  }

  /**
   * Calculate password strength score (0-100)
   */
  getStrengthScore(): number {
    let score = 0;

    // Length score (max 40 points)
    if (this.value.length >= 8) score += 10;
    if (this.value.length >= 12) score += 10;
    if (this.value.length >= 16) score += 10;
    if (this.value.length >= 20) score += 10;

    // Complexity score (max 40 points)
    const uppercaseCount = (this.value.match(/[A-Z]/g) || []).length;
    const lowercaseCount = (this.value.match(/[a-z]/g) || []).length;
    const numberCount = (this.value.match(/[0-9]/g) || []).length;
    const specialCharCount = (this.value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

    if (uppercaseCount > 0) score += 10;
    if (lowercaseCount > 0) score += 10;
    if (numberCount > 0) score += 10;
    if (specialCharCount > 0) score += 10;

    // Diversity bonus (max 20 points)
    if (numberCount >= 2) score += 5;
    if (specialCharCount >= 2) score += 10;
    if (uppercaseCount >= 2) score += 5;

    return Math.min(score, 100);
  }

  /**
   * Check if two passwords are equal
   */
  equals(other: Password): boolean {
    return this.value === other.value;
  }
}
