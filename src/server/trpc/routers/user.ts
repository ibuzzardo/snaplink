import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '../trpc';
import { users } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { updateUserSchema, changePasswordSchema } from '@/lib/validation';
import bcrypt from 'bcrypt';

export const userRouter = createTRPCRouter({
  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = BigInt(ctx.session.user.id);

      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: user[0].id.toString(),
        email: user[0].email,
        name: user[0].name,
        createdAt: user[0].createdAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error('Error getting profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get profile',
      });
    }
  }),

  // Update user profile
  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);

        const updated = await ctx.db
          .update(users)
          .set({
            name: input.name,
            email: input.email,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();

        return {
          id: updated[0].id.toString(),
          email: updated[0].email,
          name: updated[0].name,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);

        // Get user
        const user = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Verify old password
        if (!user[0].passwordHash) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Password not set. Please use OAuth or reset password.',
          });
        }

        const isValidPassword = await bcrypt.compare(
          input.oldPassword,
          user[0].passwordHash
        );

        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Current password is incorrect',
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(input.newPassword, 10);

        // Update password
        await ctx.db
          .update(users)
          .set({
            passwordHash: hashedPassword,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error changing password:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to change password',
        });
      }
    }),

  // Delete account
  deleteAccount: protectedProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = BigInt(ctx.session.user.id);

        // Get user
        const user = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (user.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Verify password
        if (user[0].passwordHash) {
          const isValidPassword = await bcrypt.compare(
            input.password,
            user[0].passwordHash
          );

          if (!isValidPassword) {
            throw new TRPCError({
              code: 'UNAUTHORIZED',
              message: 'Password is incorrect',
            });
          }
        }

        // Soft delete user
        await ctx.db
          .update(users)
          .set({
            deletedAt: new Date(),
          })
          .where(eq(users.id, userId));

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error deleting account:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete account',
        });
      }
    }),
});
