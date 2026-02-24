// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { isValidSlug, generateRandomSlug, generateSlug } from '@/lib/slug';

describe('Slug utilities', () => {
  describe('isValidSlug', () => {
    it('accepts valid slugs', () => {
      expect(isValidSlug('valid-slug')).toBe(true);
      expect(isValidSlug('abc123')).toBe(true);
      expect(isValidSlug('a')).toBe(false); // too short
      expect(isValidSlug('abcdefghijklmnopqrstu')).toBe(false); // too long
    });

    it('rejects invalid characters', () => {
      expect(isValidSlug('UPPERCASE')).toBe(false);
      expect(isValidSlug('with space')).toBe(false);
      expect(isValidSlug('with_underscore')).toBe(false);
    });

    it('rejects reserved slugs', () => {
      expect(isValidSlug('admin')).toBe(false);
      expect(isValidSlug('api')).toBe(false);
      expect(isValidSlug('auth')).toBe(false);
      expect(isValidSlug('dashboard')).toBe(false);
    });
  });

  describe('generateRandomSlug', () => {
    it('generates random slugs of correct length', () => {
      const slug = generateRandomSlug(6);
      expect(slug).toHaveLength(6);
      expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
    });

    it('generates different slugs on each call', () => {
      const slug1 = generateRandomSlug();
      const slug2 = generateRandomSlug();
      expect(slug1).not.toBe(slug2);
    });
  });

  describe('generateSlug', () => {
    it('uses custom slug if provided and valid', () => {
      expect(generateSlug('custom')).toBe('custom');
    });

    it('throws if custom slug is invalid', () => {
      expect(() => generateSlug('INVALID')).toThrow();
    });

    it('generates random slug if not provided', () => {
      const slug = generateSlug();
      expect(/^[a-z0-9]+$/.test(slug)).toBe(true);
    });
  });
});
