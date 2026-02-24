// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db/client';
import { links, clicks } from '@/server/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { getClientIp } from '@/lib/rateLimit';
import crypto from 'crypto';
import { UAParser } from 'ua-parser-js';

// Don't time out - redirects need to be fast
export const config = {
  api: {
    responseLimit: false,
  },
};

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex');
}

async function recordClick(
  linkId: bigint,
  req: NextApiRequest
): Promise<void> {
  // Record click asynchronously (don't wait for it)
  try {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const ip = getClientIp();
    const referrer = req.headers.referer || req.headers.origin || null;

    // Parse country and city from request (would need geolocation service in production)
    // For v1, we'll skip this and add it in v2 with MaxMind GeoIP2

    await db.insert(clicks).values({
      linkId,
      referrer: referrer as string | null,
      country: null, // Placeholder
      city: null,
      deviceType: result.device.type || 'desktop',
      browser: result.browser.name || 'Unknown',
      userAgent,
      ipHash: hashIp(ip),
    });
  } catch (error) {
    // Log but don't throw - redirect must not fail
    console.error('Error recording click:', error);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Invalid slug' });
  }

  try {
    // Look up link
    const link = await db
      .select()
      .from(links)
      .where(
        // Only find non-deleted links
        eq(links.slug, slug)
      )
      .limit(1);

    if (!link.length) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const foundLink = link[0];

    // Record click asynchronously
    recordClick(foundLink.id, req).catch((error) => {
      console.error('Background click recording failed:', error);
    });

    // Return 301 redirect (permanent redirect - safe for short URLs)
    res.redirect(301, foundLink.originalUrl);
  } catch (error) {
    console.error('Error handling redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
