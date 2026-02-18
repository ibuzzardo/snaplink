// Generate a random slug (6 characters: a-z, 0-9)
export function generateRandomSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate slug format
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 20) {
    return false;
  }

  // Check characters
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // Check reserved slugs
  const reserved = [
    'admin',
    'api',
    'auth',
    'dashboard',
    'account',
    'settings',
    'docs',
    'help',
    'privacy',
    'terms',
    'about',
    'contact',
    'login',
    'signup',
    'trpc',
  ];

  if (reserved.includes(slug)) {
    return false;
  }

  return true;
}

// Generate slug (with fallback to random if custom slug not provided)
export function generateSlug(customSlug?: string): string {
  if (customSlug) {
    if (!isValidSlug(customSlug)) {
      throw new Error('Invalid custom slug');
    }
    return customSlug;
  }
  return generateRandomSlug();
}
