import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '../User';
import { Email } from '../../value-objects/Email';

describe('User Entity', () => {
  let testEmail: Email;
  const testPasswordHash = '$2b$10$hashedpassword';

  beforeEach(() => {
    testEmail = Email.create('test@example.com');
  });

  describe('create', () => {
    it('should create a new user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getId()).toBeTruthy();
      expect(user.getEmail().equals(testEmail)).toBe(true);
      expect(user.getFirstName()).toBe('John');
      expect(user.getLastName()).toBe('Doe');
      expect(user.getIsActive()).toBe(true);
      expect(user.getIsEmailVerified()).toBe(false);
    });

    it('should generate email verification token on creation', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getEmailVerificationToken()).toBeTruthy();
      expect(user.getEmailVerificationToken()).toHaveLength(36); // UUID format
    });

    it('should create user with optional phone number', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+62812345678',
      });

      expect(user.getPhoneNumber()).toBe('+62812345678');
    });

    it('should create user with tenant ID', () => {
      const tenantId = 'tenant-123';
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
        tenantId,
      });

      expect(user.getTenantId()).toBe(tenantId);
    });
  });

  describe('updateProfile', () => {
    it('should update first name and last name', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.updateProfile({
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(user.getFirstName()).toBe('Jane');
      expect(user.getLastName()).toBe('Smith');
    });

    it('should update phone number', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.updateProfile({
        phoneNumber: '+62812345678',
      });

      expect(user.getPhoneNumber()).toBe('+62812345678');
    });

    it('should update avatar', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.updateProfile({
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(user.getAvatar()).toBe('https://example.com/avatar.jpg');
    });

    it('should update multiple fields at once', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.updateProfile({
        firstName: 'Jane',
        phoneNumber: '+62812345678',
        avatar: 'https://example.com/avatar.jpg',
      });

      expect(user.getFirstName()).toBe('Jane');
      expect(user.getPhoneNumber()).toBe('+62812345678');
      expect(user.getAvatar()).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('changeEmail', () => {
    it('should change email and reset verification', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      // Verify email first
      const verificationToken = user.getEmailVerificationToken()!;
      user.verifyEmail(verificationToken);
      expect(user.getIsEmailVerified()).toBe(true);

      // Change email
      const newEmail = Email.create('newemail@example.com');
      user.changeEmail(newEmail);

      expect(user.getEmail().equals(newEmail)).toBe(true);
      expect(user.getIsEmailVerified()).toBe(false);
      expect(user.getEmailVerificationToken()).toBeTruthy();
      expect(user.getEmailVerifiedAt()).toBeNull();
    });

    it('should generate new verification token on email change', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const oldToken = user.getEmailVerificationToken();
      const newEmail = Email.create('newemail@example.com');
      user.changeEmail(newEmail);
      const newToken = user.getEmailVerificationToken();

      expect(newToken).not.toBe(oldToken);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with correct token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.getEmailVerificationToken()!;
      const result = user.verifyEmail(token);

      expect(result).toBe(true);
      expect(user.getIsEmailVerified()).toBe(true);
      expect(user.getEmailVerifiedAt()).toBeInstanceOf(Date);
      expect(user.getEmailVerificationToken()).toBeNull();
    });

    it('should not verify email with incorrect token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const result = user.verifyEmail('wrong-token');

      expect(result).toBe(false);
      expect(user.getIsEmailVerified()).toBe(false);
      expect(user.getEmailVerifiedAt()).toBeNull();
    });

    it('should not verify already verified email', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.getEmailVerificationToken()!;
      user.verifyEmail(token);
      const secondVerification = user.verifyEmail(token);

      expect(secondVerification).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const newPasswordHash = '$2b$10$newhashedpassword';
      user.changePassword(newPasswordHash);

      expect(user.getPasswordHash()).toBe(newPasswordHash);
    });

    it('should clear reset tokens on password change', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.generatePasswordResetToken();
      expect(user.getPasswordResetToken()).toBeTruthy();

      user.changePassword('$2b$10$newhashedpassword');
      expect(user.getPasswordResetToken()).toBeNull();
      expect(user.getPasswordResetExpires()).toBeNull();
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate password reset token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.generatePasswordResetToken();

      expect(token).toBeTruthy();
      expect(token).toHaveLength(36); // UUID format
      expect(user.getPasswordResetToken()).toBe(token);
      expect(user.getPasswordResetExpires()).toBeInstanceOf(Date);
    });

    it('should set expiration 1 hour from now', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const now = Date.now();
      user.generatePasswordResetToken();
      const expires = user.getPasswordResetExpires()!.getTime();

      const oneHour = 60 * 60 * 1000;
      expect(expires).toBeGreaterThan(now);
      expect(expires).toBeLessThanOrEqual(now + oneHour + 1000); // +1s tolerance
    });
  });

  describe('verifyPasswordResetToken', () => {
    it('should verify valid non-expired token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.generatePasswordResetToken();
      const result = user.verifyPasswordResetToken(token);

      expect(result).toBe(true);
    });

    it('should not verify incorrect token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.generatePasswordResetToken();
      const result = user.verifyPasswordResetToken('wrong-token');

      expect(result).toBe(false);
    });

    it('should not verify expired token', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.generatePasswordResetToken();

      // Manually set expiration to past
      const userData = user.toPersistence();
      const expiredUser = User.reconstitute({
        ...userData,
        email: Email.create(userData.email),
        passwordResetExpires: new Date(Date.now() - 1000), // 1 second ago
      });

      const result = expiredUser.verifyPasswordResetToken(token);
      expect(result).toBe(false);
    });
  });

  describe('activate and deactivate', () => {
    it('should activate inactive user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.deactivate();
      expect(user.getIsActive()).toBe(false);

      user.activate();
      expect(user.getIsActive()).toBe(true);
    });

    it('should deactivate active user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getIsActive()).toBe(true);
      user.deactivate();
      expect(user.getIsActive()).toBe(false);
    });
  });

  describe('soft delete', () => {
    it('should mark user as deleted', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.delete();

      expect(user.isDeleted()).toBe(true);
      expect(user.getDeletedAt()).toBeInstanceOf(Date);
    });

    it('should restore deleted user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.delete();
      expect(user.isDeleted()).toBe(true);

      user.restore();
      expect(user.isDeleted()).toBe(false);
      expect(user.getDeletedAt()).toBeNull();
    });
  });

  describe('canLogin', () => {
    it('should return true for active, non-deleted user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.canLogin()).toBe(true);
    });

    it('should return false for inactive user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.deactivate();
      expect(user.canLogin()).toBe(false);
    });

    it('should return false for deleted user', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      user.delete();
      expect(user.canLogin()).toBe(false);
    });
  });

  describe('requiresEmailVerification', () => {
    it('should return true for unverified email', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.requiresEmailVerification()).toBe(true);
    });

    it('should return false for verified email', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const token = user.getEmailVerificationToken()!;
      user.verifyEmail(token);

      expect(user.requiresEmailVerification()).toBe(false);
    });
  });

  describe('recordLogin', () => {
    it('should update last login timestamp', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getLastLoginAt()).toBeNull();

      const beforeLogin = Date.now();
      user.recordLogin();
      const afterLogin = Date.now();

      const lastLogin = user.getLastLoginAt()!;
      expect(lastLogin).toBeInstanceOf(Date);
      expect(lastLogin.getTime()).toBeGreaterThanOrEqual(beforeLogin);
      expect(lastLogin.getTime()).toBeLessThanOrEqual(afterLogin);
    });
  });

  describe('getFullName', () => {
    it('should return full name', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user.getFullName()).toBe('John Doe');
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute user from persistence data', () => {
      const user = User.create({
        email: testEmail,
        passwordHash: testPasswordHash,
        firstName: 'John',
        lastName: 'Doe',
      });

      const persistence = user.toPersistence();
      const reconstituted = User.reconstitute({
        ...persistence,
        email: Email.create(persistence.email),
      });

      expect(reconstituted.getId()).toBe(user.getId());
      expect(reconstituted.getEmail().equals(user.getEmail())).toBe(true);
      expect(reconstituted.getFirstName()).toBe(user.getFirstName());
      expect(reconstituted.getLastName()).toBe(user.getLastName());
    });
  });
});
