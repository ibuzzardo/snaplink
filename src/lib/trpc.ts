// @ts-nocheck
import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import superjson from 'superjson';
import type { AppRouter } from '@/server/trpc/routers';

const getBaseUrl = () => {
  if (typeof window !== 'undefined')
    return ''; // browser should use relative url
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request.
           * You can use this to pass authentication tokens or other headers.
           */
          async headers() {
            return {};
          },
        }),
      ],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
});
