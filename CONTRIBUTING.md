# Contributing to SnapLink

Thanks for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful and constructive. We're building something cool together.

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16 (or Docker)
- Git

### Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/ibuzzardo/snaplink.git
cd snaplink

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start database
docker-compose up postgres -d

# 5. Run migrations
npm run db:migrate

# 6. Start dev server
npm run dev

# 7. Open http://localhost:3000
```

---

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/...` — New features
- `fix/...` — Bug fixes
- `docs/...` — Documentation
- `refactor/...` — Code improvements
- `test/...` — Test additions

### Code Style

We use:
- **TypeScript strict mode** — No `any` types without justification
- **ESLint** — Code quality rules
- **Prettier** — Code formatting

Check before committing:

```bash
npm run lint      # Check for linting errors
npm run format    # Auto-format code
npm run type-check # Check TypeScript
```

### Testing

Write tests for all new features:

```bash
npm run test              # Run tests
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
```

Test coverage target: **>80%** for new code.

### Git Commit Messages

Use clear, descriptive commit messages:

```
feat(auth): add GitHub OAuth provider
fix(dashboard): resolve pagination bug
docs(api): add authentication section
test(links): add slug validation tests
```

Format: `type(scope): description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Submitting Changes

### Before Creating a PR

1. **Sync with main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all checks:**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

3. **Update documentation** if needed (README, API.md, etc.)

### Creating a Pull Request

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub** with:
   - Clear title and description
   - Link to related issues (e.g., `Closes #123`)
   - Screenshots if UI changes
   - Testing instructions

3. **PR Template:**
   ```markdown
   ## Description
   What does this PR do?

   ## Motivation
   Why is this change needed?

   ## Testing
   How can reviewers test this?

   ## Screenshots
   (if applicable)

   ## Checklist
   - [ ] Tests pass locally
   - [ ] Coverage >80%
   - [ ] No TypeScript errors
   - [ ] ESLint passes
   - [ ] Updated documentation
   ```

### Code Review

- ✅ All CI checks must pass
- ✅ At least one approval required
- ✅ Conversations resolved
- ✅ Ready to merge

---

## Project Structure

```
snaplink-app/
├── src/
│   ├── pages/           (Next.js pages & API routes)
│   ├── server/          (Backend: tRPC, auth, DB)
│   ├── lib/             (Utilities: validation, auth, etc.)
│   ├── styles/          (CSS)
│   └── __tests__/       (Tests)
├── drizzle/
│   └── migrations/      (Database schemas)
├── public/              (Static assets)
├── .github/
│   └── workflows/       (CI/CD)
├── scripts/             (Utility scripts)
├── docs/                (Documentation)
└── tests/               (E2E tests)
```

---

## Architecture Principles

### Backend
- **Type-safe:** TypeScript for server and client
- **Minimal:** Only what's needed for MVP
- **Secure:** Validation, auth, rate limiting
- **Tested:** Unit + integration tests

### Frontend
- **Responsive:** Mobile-first design
- **Accessible:** WCAG compliant
- **Fast:** Optimized bundle, code splitting
- **User-friendly:** Clear errors, loading states

### Database
- **Normalized:** Proper schema design
- **Indexed:** Performance optimized
- **Migrated:** Version-controlled schema

---

## Common Tasks

### Adding a New tRPC Procedure

1. **Create procedure in router:**
   ```typescript
   // src/server/trpc/routers/example.ts
   export const exampleRouter = createTRPCRouter({
     newProcedure: publicProcedure
       .input(z.object({ /* ... */ }))
       .mutation(async ({ ctx, input }) => {
         // implementation
       }),
   });
   ```

2. **Add to main router:**
   ```typescript
   // src/server/trpc/routers/index.ts
   export const appRouter = createTRPCRouter({
     example: exampleRouter,
   });
   ```

3. **Use on frontend:**
   ```typescript
   const mutation = trpc.example.newProcedure.useMutation();
   mutation.mutate({ /* ... */ });
   ```

### Adding a New Page

1. **Create page file:**
   ```typescript
   // src/pages/new-page.tsx
   export default function NewPage() {
     return <div>New page</div>;
   }
   ```

2. **Add to navigation** (if needed in dashboard)

3. **Add tests:**
   ```typescript
   // src/__tests__/pages/new-page.test.tsx
   describe('NewPage', () => {
     it('renders', () => {
       // test code
     });
   });
   ```

### Adding a Database Table

1. **Update Drizzle schema:**
   ```typescript
   // src/server/db/schema.ts
   export const newTable = pgTable('new_table', {
     id: bigserial('id', { mode: 'bigint' }).primaryKey(),
     // fields...
   });
   ```

2. **Generate migration:**
   ```bash
   npm run db:generate
   ```

3. **Review migration** in `drizzle/migrations/`

4. **Apply migration:**
   ```bash
   npm run db:migrate
   ```

---

## Performance Considerations

### Frontend
- Use React.memo for expensive components
- Lazy load heavy libraries (Recharts, etc.)
- Optimize images
- Code splitting with dynamic imports

### Backend
- Index frequently queried columns
- Use connection pooling
- Cache repeated queries (coming v2)
- Monitor slow queries

### Database
- Use EXPLAIN ANALYZE for slow queries
- Composite indexes for joins
- Archival strategy for old data

---

## Security Guidelines

### When Writing Code
- ✅ Validate all inputs (Zod schemas)
- ✅ Never log sensitive data (passwords, tokens)
- ✅ Use parameterized queries (Drizzle handles this)
- ✅ Escape output (React does this by default)
- ✅ Check user ownership before operations
- ✅ Rate limit expensive operations

### Before Committing
- ✅ No hardcoded secrets or API keys
- ✅ No console.log for sensitive data
- ✅ No credential in .env.local (use .env.example)
- ✅ Check for dependency vulnerabilities: `npm audit`

---

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Found a bug?** Open a GitHub Issue with reproduction steps
- **Need clarification?** Ask in the issue/PR

---

## License

By contributing, you agree your work will be licensed under MIT license.

---

Thank you for contributing! 🙏

