// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { urlSchema, emailSchema, passwordSchema, createLinkSchema } from '@/lib/validation';

describe('Validation schemas', () => {
  describe('urlSchema', () => {
    it('accepts valid URLs', () => {
      expect(() => urlSchema.parse('https://example.com')).not.toThrow();
      expect(() => urlSchema.parse('http://google.com/search?q=test')).not.toThrow();
      expect(() => urlSchema.parse('https://example.com/very/long/path')).not.toThrow();
    });

    it('rejects invalid URLs', () => {
      expect(() => urlSchema.parse('not a url')).toThrow();
      expect(() => urlSchema.parse('example.com')).toThrow();
      expect(() => urlSchema.parse('')).toThrow();
    });
  });

  describe('emailSchema', () => {
    it('accepts valid emails', () => {
      expect(() => emailSchema.parse('user@example.com')).not.toThrow();
      expect(() => emailSchema.parse('test+tag@domain.co.uk')).not.toThrow();
    });

    it('rejects invalid emails', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
      expect(() => emailSchema.parse('user@')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('accepts strong passwords', () => {
      expect(() => passwordSchema.parse('StrongPass123')).not.toThrow();
      expect(() => passwordSchema.parse('MyPassword2024')).not.toThrow();
    });

    it('rejects weak passwords', () => {
      expect(() => passwordSchema.parse('weak')).toThrow(); // too short
      expect(() => passwordSchema.parse('nouppercase123')).toThrow();
      expect(() => passwordSchema.parse('NOLOWERCASE123')).toThrow();
      expect(() => passwordSchema.parse('NoNumbers')).toThrow();
    });
  });

  describe('createLinkSchema', () => {
    it('accepts valid inputs', () => {
      expect(() =>
        createLinkSchema.parse({
          url: 'https://example.com',
        })
      ).not.toThrow();

      expect(() =>
        createLinkSchema.parse({
          url: 'https://example.com',
          customSlug: 'myslug',
        })
      ).not.toThrow();
    });

    it('rejects invalid inputs', () => {
      expect(() => createLinkSchema.parse({})).toThrow();
      expect(() =>
        createLinkSchema.parse({
          url: 'invalid-url',
        })
      ).toThrow();
    });
  });
});
