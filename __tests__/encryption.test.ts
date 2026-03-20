import { describe, it, expect, beforeAll } from 'vitest';

// Set test encryption key before importing
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

import { encryptContent, decryptContent, isUnlockable } from '@/lib/encryption/capsule';

describe('Time Capsule Encryption', () => {
  it('encrypts and decrypts content correctly', () => {
    const original = 'Dear baby, I love you so much. This is a letter for your future.';
    const encrypted = encryptContent(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':');

    const decrypted = decryptContent(encrypted);
    expect(decrypted).toBe(original);
  });

  it('produces different ciphertexts for same plaintext (random IV)', () => {
    const text = 'Same message, different encryption';
    const enc1 = encryptContent(text);
    const enc2 = encryptContent(text);
    expect(enc1).not.toBe(enc2);

    expect(decryptContent(enc1)).toBe(text);
    expect(decryptContent(enc2)).toBe(text);
  });

  it('handles unicode content', () => {
    const unicode = 'Baby Brynleigh 🍓❤️ — first smile! Ñoño';
    const encrypted = encryptContent(unicode);
    const decrypted = decryptContent(encrypted);
    expect(decrypted).toBe(unicode);
  });

  it('handles empty content', () => {
    const encrypted = encryptContent('');
    const decrypted = decryptContent(encrypted);
    expect(decrypted).toBe('');
  });

  it('detects tampering', () => {
    const encrypted = encryptContent('Secret message');
    const parts = encrypted.split(':');
    parts[2] = parts[2].replace(/^./, 'f'); // tamper with ciphertext
    expect(() => decryptContent(parts.join(':'))).toThrow();
  });
});

describe('Unlock Date Enforcement', () => {
  it('returns false for future dates', () => {
    const futureDate = new Date('2040-01-01');
    expect(isUnlockable(futureDate)).toBe(false);
  });

  it('returns true for past dates', () => {
    const pastDate = new Date('2020-01-01');
    expect(isUnlockable(pastDate)).toBe(true);
  });

  it('returns true for current date', () => {
    const now = new Date();
    expect(isUnlockable(now)).toBe(true);
  });
});
