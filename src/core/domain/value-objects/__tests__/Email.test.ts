import { describe, it, expect } from 'vitest';
import { Email } from '../Email';

describe('Email Value Object', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('Test@Example.COM');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => Email.create('notanemail')).toThrow('Invalid email format');
    });

    it('should throw error for email without @', () => {
      expect(() => Email.create('test.example.com')).toThrow('Invalid email format');
    });

    it('should throw error for email without domain', () => {
      expect(() => Email.create('test@')).toThrow('Invalid email format');
    });

    it('should throw error for email without local part', () => {
      expect(() => Email.create('@example.com')).toThrow('Invalid email format');
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw error for email exceeding 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => Email.create(longEmail)).toThrow('Email is too long');
    });

    it('should accept valid email with subdomain', () => {
      const email = Email.create('user@mail.example.com');
      expect(email.getValue()).toBe('user@mail.example.com');
    });

    it('should accept valid email with numbers', () => {
      const email = Email.create('user123@example.com');
      expect(email.getValue()).toBe('user123@example.com');
    });

    it('should accept valid email with dots', () => {
      const email = Email.create('user.name@example.com');
      expect(email.getValue()).toBe('user.name@example.com');
    });

    it('should accept valid email with hyphens', () => {
      const email = Email.create('user-name@example.com');
      expect(email.getValue()).toBe('user-name@example.com');
    });

    it('should accept valid email with plus sign', () => {
      const email = Email.create('user+tag@example.com');
      expect(email.getValue()).toBe('user+tag@example.com');
    });
  });

  describe('getLocalPart', () => {
    it('should return local part of email', () => {
      const email = Email.create('test@example.com');
      expect(email.getLocalPart()).toBe('test');
    });

    it('should return local part with special characters', () => {
      const email = Email.create('test.user+tag@example.com');
      expect(email.getLocalPart()).toBe('test.user+tag');
    });
  });

  describe('getDomain', () => {
    it('should return domain of email', () => {
      const email = Email.create('test@example.com');
      expect(email.getDomain()).toBe('example.com');
    });

    it('should return subdomain', () => {
      const email = Email.create('test@mail.example.com');
      expect(email.getDomain()).toBe('mail.example.com');
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for same email with different case', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('TEST@EXAMPLE.COM');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });

  // Note: Immutability is enforced by TypeScript's readonly at compile-time
  // Runtime immutability would require Object.freeze() but that has performance costs
});
