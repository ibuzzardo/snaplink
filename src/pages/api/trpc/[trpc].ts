// @ts-nocheck
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '@/server/trpc/routers';
import { createContext } from '@/server/trpc/context';

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error, type, path, input, ctx, req }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // log to external service
      console.error(`Error in tRPC handler on path: ${path}`, error);
    } else {
      // log the error
      console.debug(`Non-fatal error in tRPC handler on path: ${path}:`, error);
    }
  },
});
