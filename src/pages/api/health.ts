// @ts-nocheck
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/server/db/client';
import { sql } from 'drizzle-orm';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime: number;
    };
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  const startTime = Date.now();

  try {
    // Check database connectivity
    const dbStartTime = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbResponseTime = Date.now() - dbStartTime;

    const uptime = process.uptime();
    const responseTime = Date.now() - startTime;

    // Determine overall status
    let status: 'ok' | 'degraded' | 'error' = 'ok';
    if (dbResponseTime > 1000) {
      status = 'degraded';
    }

    res.status(status === 'ok' ? 200 : 503).json({
      status,
      timestamp: new Date().toISOString(),
      uptime,
      checks: {
        database: {
          status: 'ok',
          responseTime: dbResponseTime,
        },
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'error',
          responseTime: Date.now() - startTime,
        },
      },
    });
  }
}
