// @ts-nocheck
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, createTRPCRouter } from '../trpc';
import { clicks, links } from '@/server/db/schema';
import { eq, and, gte, isNull } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export const analyticsRouter = createTRPCRouter({
  // Get analytics for a link
  get: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        period: z.enum(['hour', 'day', 'week', 'month']).default('day'),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Get link
        const link = await ctx.db
          .select()
          .from(links)
          .where(and(eq(links.slug, input.slug), isNull(links.deletedAt)))
          .limit(1);

        if (link.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Link not found',
          });
        }

        const linkId = link[0].id;

        // Calculate date range based on period
        const now = new Date();
        let startDate = new Date();
        let groupByClause: string;

        switch (input.period) {
          case 'hour':
            startDate.setHours(startDate.getHours() - 24);
            groupByClause = "DATE_TRUNC('hour', created_at)";
            break;
          case 'week':
            startDate.setDate(startDate.getDate() - 7);
            groupByClause = "DATE_TRUNC('day', created_at)";
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            groupByClause = "DATE_TRUNC('day', created_at)";
            break;
          case 'day':
          default:
            startDate.setDate(startDate.getDate() - 1);
            groupByClause = "DATE_TRUNC('hour', created_at)";
            break;
        }

        // Get total clicks
        const totalClicksResult = await ctx.db
          .select({ count: sql<number>`COUNT(*)` })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate)
            )
          );

        const totalClicks = totalClicksResult[0]?.count || 0;

        // Get unique clicks (deduplicated by IP hash)
        const uniqueClicksResult = await ctx.db
          .select({ count: sql<number>`COUNT(DISTINCT ip_hash)` })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate)
            )
          );

        const uniqueClicks = uniqueClicksResult[0]?.count || 0;

        // Get clicks by time
        const clicksByTimeResult = await ctx.db.execute(sql`
          SELECT 
            ${sql.raw(groupByClause)} as timestamp,
            COUNT(*) as clicks
          FROM ${clicks}
          WHERE link_id = ${linkId} AND created_at >= ${startDate}
          GROUP BY ${sql.raw(groupByClause)}
          ORDER BY timestamp ASC
        `);

        const clicksByTime = (clicksByTimeResult.rows || []).map((row: any) => ({
          timestamp: row.timestamp,
          clicks: Number(row.clicks),
        }));

        // Get top referrers
        const topReferrersResult = await ctx.db
          .select({
            referrer: clicks.referrer,
            count: sql<number>`COUNT(*) as count`,
          })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate),
              sql`referrer IS NOT NULL`
            )
          )
          .groupBy(clicks.referrer)
          .orderBy(sql`count DESC`)
          .limit(10);

        // Get top countries
        const topCountriesResult = await ctx.db
          .select({
            country: clicks.country,
            count: sql<number>`COUNT(*) as count`,
          })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate),
              sql`country IS NOT NULL`
            )
          )
          .groupBy(clicks.country)
          .orderBy(sql`count DESC`)
          .limit(10);

        // Get device breakdown
        const deviceBreakdownResult = await ctx.db
          .select({
            deviceType: clicks.deviceType,
            count: sql<number>`COUNT(*) as count`,
          })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate)
            )
          )
          .groupBy(clicks.deviceType);

        const deviceBreakdown = {
          mobile: 0,
          tablet: 0,
          desktop: 0,
        };

        deviceBreakdownResult.forEach((row) => {
          if (row.deviceType === 'mobile') deviceBreakdown.mobile = Number(row.count);
          else if (row.deviceType === 'tablet') deviceBreakdown.tablet = Number(row.count);
          else if (row.deviceType === 'desktop') deviceBreakdown.desktop = Number(row.count);
        });

        // Get browser breakdown
        const browserBreakdownResult = await ctx.db
          .select({
            browser: clicks.browser,
            count: sql<number>`COUNT(*) as count`,
          })
          .from(clicks)
          .where(
            and(
              eq(clicks.linkId, linkId),
              gte(clicks.createdAt, startDate),
              sql`browser IS NOT NULL`
            )
          )
          .groupBy(clicks.browser)
          .orderBy(sql`count DESC`)
          .limit(10);

        return {
          slug: input.slug,
          totalClicks,
          uniqueClicks,
          clicksByTime,
          topReferrers: topReferrersResult.map((r) => ({
            referrer: r.referrer || 'direct',
            clicks: Number(r.count),
          })),
          topCountries: topCountriesResult.map((r) => ({
            country: r.country || 'Unknown',
            clicks: Number(r.count),
          })),
          deviceBreakdown,
          browserBreakdown: browserBreakdownResult.map((r) => ({
            browser: r.browser || 'Unknown',
            clicks: Number(r.count),
          })),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error getting analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get analytics',
        });
      }
    }),
});
