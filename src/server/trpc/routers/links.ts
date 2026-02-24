// @ts-nocheck
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, createTRPCRouter } from '../trpc';
import { links } from '@/server/db/schema';
import { eq, and, desc, isNull, ne } from 'drizzle-orm';
import { createLinkSchema, updateLinkSchema, deleteLinkSchema } from '@/lib/validation';
import { generateSlug, isValidSlug } from '@/lib/slug';

export const linksRouter = createTRPCRouter({
  // Create a new short link (protected + public)
  create: publicProcedure
    .input(createLinkSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const slug = generateSlug(input.customSlug);

        // Verify slug is not already taken
        const existing = await ctx.db
          .select()
          .from(links)
          .where(eq(links.slug, slug))
          .limit(1);

        if (existing.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This slug is already in use',
          });
        }

        // Create link
        const newLink = await ctx.db
          .insert(links)
          .values({
            slug,
            originalUrl: input.url,
            userId: ctx.session?.user?.id ? BigInt(ctx.session.user.id) : null,
            customSlug: input.customSlug ? true : false,
          })
          .returning();

        return {
          slug: newLink[0].slug,
          shortUrl: `${process.env.NEXT_PUBLIC_API_URL}/${newLink[0].slug}`,
          createdAt: newLink[0].createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error creating link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create link',
        });
      }
    }),

  // List user's links (protected)
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);
        const offset = (input.page - 1) * input.limit;

        // Get total count
        const countResult = await ctx.db
          .select()
          .from(links)
          .where(
            and(eq(links.userId, userId), isNull(links.deletedAt))
          )
          .limit(1);

        // Get paginated links
        const userLinks = await ctx.db
          .select()
          .from(links)
          .where(
            and(eq(links.userId, userId), isNull(links.deletedAt))
          )
          .orderBy(desc(links.createdAt))
          .limit(input.limit)
          .offset(offset);

        return {
          data: userLinks.map((link) => ({
            id: link.id.toString(),
            slug: link.slug,
            originalUrl: link.originalUrl,
            createdAt: link.createdAt,
            shortUrl: `${process.env.NEXT_PUBLIC_API_URL}/${link.slug}`,
          })),
          total: countResult.length,
          page: input.page,
          pages: Math.ceil(countResult.length / input.limit),
        };
      } catch (error) {
        console.error('Error listing links:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to list links',
        });
      }
    }),

  // Get link details (public - but checks ownership if authenticated)
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const link = await ctx.db
          .select()
          .from(links)
          .where(
            and(eq(links.slug, input.slug), isNull(links.deletedAt))
          )
          .limit(1);

        if (link.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Link not found',
          });
        }

        const foundLink = link[0];

        // Check ownership if authenticated
        if (ctx.session?.user) {
          if (foundLink.userId && BigInt(ctx.session.user.id) !== foundLink.userId) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'You do not have access to this link',
            });
          }
        } else if (foundLink.userId) {
          // If not authenticated and link is owned, don't return full details
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to view this link',
          });
        }

        return {
          id: foundLink.id.toString(),
          slug: foundLink.slug,
          originalUrl: foundLink.originalUrl,
          createdAt: foundLink.createdAt,
          customSlug: foundLink.customSlug,
          shortUrl: `${process.env.NEXT_PUBLIC_API_URL}/${foundLink.slug}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error getting link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get link',
        });
      }
    }),

  // Update link (protected)
  update: protectedProcedure
    .input(updateLinkSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);

        // Check ownership
        const link = await ctx.db
          .select()
          .from(links)
          .where(eq(links.slug, input.slug))
          .limit(1);

        if (link.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Link not found',
          });
        }

        if (link[0].userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this link',
          });
        }

        // Update link
        const updated = await ctx.db
          .update(links)
          .set({
            originalUrl: input.originalUrl,
            updatedAt: new Date(),
          })
          .where(eq(links.slug, input.slug))
          .returning();

        return {
          slug: updated[0].slug,
          originalUrl: updated[0].originalUrl,
          updatedAt: updated[0].updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update link',
        });
      }
    }),

  // Delete link (protected - soft delete)
  delete: protectedProcedure
    .input(deleteLinkSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);

        // Check ownership
        const link = await ctx.db
          .select()
          .from(links)
          .where(eq(links.slug, input.slug))
          .limit(1);

        if (link.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Link not found',
          });
        }

        if (link[0].userId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this link',
          });
        }

        // Soft delete
        await ctx.db
          .update(links)
          .set({
            deletedAt: new Date(),
          })
          .where(eq(links.slug, input.slug));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error deleting link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete link',
        });
      }
    }),
});
