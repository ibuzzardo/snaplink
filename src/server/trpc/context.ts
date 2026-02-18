import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import type { NextRequest } from 'next/server';
import { db } from '@/server/db/client';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface CreateContextOptions {
  session: Session | null;
}

export async function createContextInner(opts: CreateContextOptions) {
  return {
    session: opts.session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * This helper generates the "internals" for your tRPC context. If you need to use it (e.g. inside a handler for middleware), you can export it (but you'll need to do so safely to not expose critical secrets to the client)
 */
export const createInnerTRPCContext = async (): Promise<Context> => {
  const session = await getServerSession(authOptions);

  return createContextInner({
    session,
  });
};

/**
 * Outer function for `createContext` where the context is used.
 * @see https://trpc.io/docs/context#outer-context "parametrize your middlewares"
 */
export const createContext = async (): Promise<Context> => {
  return createInnerTRPCContext();
};
