# snaplink — Agent Conventions

## Project Overview
- **Name**: snaplink
- **Description**: Production-ready URL shortener with real-time analytics
- **Slug / Directory**: /opt/projects/snaplink/

## Directory Structure
```
snaplink/
  src/
  styles/
    globals.css
  pages/
    _app.tsx
    account.tsx
    dashboard.tsx
    index.tsx
    links/
      [slug].tsx
    api/
      [slug].ts
      health.ts
      trpc/
        [trpc].ts
      auth/
        [...nextauth].ts
        register.ts
    auth/
      signin.tsx
      signup.tsx
  __tests__/
    setup.ts
    lib/
      slug.test.ts
      validation.test.ts
  server/
    trpc/
      context.ts
      trpc.ts
      routers/
        analytics.ts
        index.ts
        links.ts
        user.ts
    db/
      client.ts
      schema.ts
  lib/
    rateLimit.ts
```

## TypeScript Path Aliases
The `@/*` alias is configured in `tsconfig.json` to map to `./src/*`:
```json
"paths": { "@/*": ["./src/*"] }
```

### Import Rules (CRITICAL)
- ✅ CORRECT: `import { Button } from '@/components/ui/button'`
- ✅ CORRECT: `import { db } from '@/db/index'`
- ✅ CORRECT: `import type { User } from '@/types'`
- ❌ WRONG: `import { Button } from '@/src/components/ui/button'` — NEVER use `@/src/`
- ❌ WRONG: `import { Button } from '../components/ui/button'` — use `@/` alias instead
- ❌ WRONG: `import { Button } from './src/components/ui/button'`

**All source files live under `src/`. The alias strips `src/` for you.**

## File Output Format
When generating or modifying files, always use this exact format:
```
--- FILE: src/app/page.tsx ---
<file contents here>
--- FILE: src/components/example.tsx ---
<file contents here>
```

## Available Dependencies
next, react, react-dom, typescript, @trpc/client, @trpc/react-query, @trpc/server, @hookform/resolvers, @next-auth/prisma-adapter, next-auth, react-hook-form, zod, drizzle-orm, pg, bcrypt

## Code Style
- TypeScript strict mode enabled
- Use `async/await` for async operations  
- Use `'use client'` directive only when necessary (client components)
- API routes go in `src/app/api/*/route.ts`
- Components go in `src/components/`
- Database/server utilities go in `src/lib/` or `src/db/`
- Do not create files outside of `src/` (except config files at root)
