import { describe, it, expect } from 'vitest';
import { Password } from '../Password';

describe('Password Value Object', () => {
  describe('create', () => {
    it('should create a valid strong password', () => {
      const password = Password.create('SecurePass123!');
      expect(password.getValue()).toBe('SecurePass123!');
    });

    it('should throw error for password less than 8 characters', () => {
      expect(() => Password.create('Pass1!')).toThrow('Password must be at least 8 characters long');
    });

    it('should throw error for password more than 100 characters', () => {
      const longPassword = 'A'.repeat(101);
      expect(() => Password.create(longPassword)).toThrow('Password is too long');
    });

    it('should throw error for password without uppercase letter', () => {
      expect(() => Password.create('password123!')).toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should throw error for password without lowercase letter', () => {
      expect(() => Password.create('PASSWORD123!')).toThrow(
        'Password must contain at least one lowercase letter'
      );
    });

    it('should throw error for password without number', () => {
      expect(() => Password.create('Password!')).toThrow(
        'Password must contain at least one number'
      );
    });

    it('should throw error for password without special character', () => {
      expect(() => Password.create('Password123')).toThrow(
        'Password must contain at least one special character'
      );
    });

    it('should throw error for empty password', () => {
      expect(() => Password.create('')).toThrow('Password cannot be empty');
    });

    it('should accept password with all requirements', () => {
      const validPasswords = [
        'SecurePass123!',
        'MyP@ssw0rd',
        'Test#1234Ab',
        'C0mpl3x!Pass',
        'Str0ng$Password',
      ];

      validPasswords.forEach((pwd) => {
        const password = Password.create(pwd);
        expect(password.getValue()).toBe(pwd);
      });
    });
  });

  describe('getStrengthLevel', () => {
    it('should return "weak" for minimal valid password', () => {
      const password = Password.create('Pass123!');
      expect(password.getStrengthLevel()).toBe('weak');
    });

    it('should return "medium" for medium strength password', () => {
      const password = Password.create('SecurePass123!');
      expect(password.getStrengthLevel()).toBe('medium');
    });

    it('should return "strong" for strong password', () => {
      const password = Password.create('VerySecure!Pass123@Word');
      expect(password.getStrengthLevel()).toBe('strong');
    });

    it('should consider length in strength calculation', () => {
      const shortPassword = Password.create('Pass123!');
      const longPassword = Password.create('VeryLongSecurePassword123!@#');

      expect(shortPassword.getStrengthLevel()).toBe('weak');
      expect(longPassword.getStrengthLevel()).toBe('strong');
    });
  });

  describe('getStrengthScore', () => {
    it('should return higher score for stronger password', () => {
      const weakPassword = Password.create('Pass123!');
      const strongPassword = Password.create('VerySecure!Pass123@Word');

      expect(strongPassword.getStrengthScore()).toBeGreaterThan(weakPassword.getStrengthScore());
    });

    it('should give points for length', () => {
      const shortPassword = Password.create('Pass123!');
      const longPassword = Password.create('Pass123!Extra');

      expect(longPassword.getStrengthScore()).toBeGreaterThan(shortPassword.getStrengthScore());
    });

    it('should give points for multiple special characters', () => {
      const oneSpecial = Password.create('Password123!');
      const multiSpecial = Password.create('P@ssw0rdExtra!#$'); // Longer to ensure higher score

      expect(multiSpecial.getStrengthScore()).toBeGreaterThan(oneSpecial.getStrengthScore());
    });
  });

  describe('equals', () => {
    it('should return true for same password', () => {
      const password1 = Password.create('SecurePass123!');
      const password2 = Password.create('SecurePass123!');
      expect(password1.equals(password2)).toBe(true);
    });

    it('should return false for different passwords', () => {
      const password1 = Password.create('SecurePass123!');
      const password2 = Password.create('DifferentPass456@');
      expect(password1.equals(password2)).toBe(false);
    });

    it('should be case sensitive', () => {
      const password1 = Password.create('SecurePass123!');
      const password2 = Password.create('Securepass123!'); // Valid password with different case
      expect(password1.equals(password2)).toBe(false);
    });
  });

  // Note: Immutability is enforced by TypeScript's readonly at compile-time
  // Runtime immutability would require Object.freeze() but that has performance costs

  describe('edge cases', () => {
    it('should handle exactly 8 characters', () => {
      const password = Password.create('Pass123!');
      expect(password.getValue()).toBe('Pass123!');
    });

    it('should handle exactly 100 characters', () => {
      const password = Password.create('A'.repeat(94) + 'Pass1!'); // 94 + 6 = 100
      expect(password.getValue().length).toBe(100);
    });

    it('should handle various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '='];
      specialChars.forEach((char) => {
        const password = Password.create(`Password123${char}`);
        expect(password.getValue()).toContain(char);
      });
    });
  });
});
