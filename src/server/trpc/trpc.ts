// @ts-nocheck
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Create a router from procedures and sub-routers - `router` only works in Node.js.
 * @see https://trpc.io/docs/context#inner-routers
 */
export const router = t.router;

/**
 * Create an unprotected (public) procedure
 * @link https://trpc.io/docs/procedures
 */
export const publicProcedure = t.procedure;

/**
 * Create a protected (authenticated) procedure
 * @link https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to use this procedure',
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const createTRPCRouter = t.router;
