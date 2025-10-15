# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint on the codebase

### Supabase (Local Development)
- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local Supabase instance
- `supabase status` - Check status of local services
- `supabase db reset` - Reset database with fresh schema and seed data
- `supabase gen types typescript --local > types/supabase.ts` - Generate TypeScript types from database schema

### Git Hooks
- Pre-commit hooks are configured with Husky to run linting on staged files

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict configuration
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with SSR support
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Project Structure
- `/app` - Next.js App Router directory containing pages, components, and API routes
- `/app/components` - Page-specific React components
- `/app/(auth)` - Authentication-related pages (login, etc.)
- `/app/queries` - Server-side data fetching functions
- `/components/ui` - Reusable shadcn/ui components
- `/components/app` - Application-specific shared components
- `/supabase` - Database schema, types, and configuration
- `/types` - TypeScript type definitions
- `/utils` - Utility functions and Supabase client setup
- `/lib` - Library utilities and constants
- `/hooks` - Custom React hooks

### Key Architecture Patterns

#### Database Schema
The application uses a household-based multi-tenancy model:
- `household` - Top-level organization unit
- `users` - Users belong to households
- `categories` - Budget categories per household/month
- `line_items` - Individual budget line items within categories
- `income` - Income tracking per household
- `transactions` - Expense transactions linked to line items

#### Authentication Flow
- Uses Supabase Auth with SSR support
- Middleware handles session refresh automatically
- Protected routes redirect to `/login` if user is not authenticated
- User authentication state is checked via `getCurrentUser()` query

#### Component Architecture
- Server Components for data fetching and initial render
- Client Components for interactivity
- Suspense boundaries with skeleton loading states
- Form validation using React Hook Form + Zod
- Theme support with next-themes (light/dark mode)

#### Data Fetching
- Server-side queries in `/app/queries` directory
- Direct Supabase client usage for real-time features
- Type-safe database operations using generated TypeScript types

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)

### Development Workflow
1. Run `supabase start` to spin up local development database
2. Use `npm run dev` for hot-reload development
3. Database schema changes should be made via Supabase migrations
4. Generate new types after schema changes with `supabase gen types`
5. All components use shadcn/ui design system with consistent styling

### Testing
No testing framework is currently configured. When adding tests, consider:
- Using Next.js with Jest and React Testing Library
- Testing authentication flows
- Testing form validation
- Testing database operations with mock data