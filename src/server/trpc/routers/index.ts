import { createTRPCRouter } from '../trpc';
import { linksRouter } from './links';
import { analyticsRouter } from './analytics';
import { userRouter } from './user';

/**
 * This is the primary router for your server.
 *
 * All routers added in /pages/api/trpc/[trpc].ts should be manually added here
 * (unless you want to use the auto-import approach - see note below)
 */
export const appRouter = createTRPCRouter({
  links: linksRouter,
  analytics: analyticsRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
