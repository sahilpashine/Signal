# Signal — AI-Powered GTM Intelligence

A full-stack web application that generates comprehensive go-to-market strategies using AI. Describe any product and get a complete GTM brief—ICP, positioning statement, value propositions, channel messaging, and competitive differentiation—in seconds.

## Quick Start

### Prerequisites
- Node.js 22+
- pnpm
- MySQL/TiDB database

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd signal-gtm

# Install dependencies
pnpm install

# Set up environment variables
# Create a .env file with the variables listed in the Environment Variables section below

# Run database migrations
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173` (frontend) and `http://localhost:3000` (backend API).

## Project Structure

```
signal-gtm/
├── client/                 # React 19 frontend
│   ├── src/
│   │   ├── pages/         # Page components (Home, AppDashboard, NewBrief, BriefDetail, etc.)
│   │   ├── components/    # Reusable UI components (AppLayout, etc.)
│   │   ├── lib/           # tRPC client, utilities
│   │   ├── contexts/      # React contexts (ThemeContext)
│   │   ├── hooks/         # Custom hooks (useAuth, etc.)
│   │   └── index.css      # Global styles (Tailwind + custom animations)
│   └── public/            # Static assets
├── server/                # Express + tRPC backend
│   ├── routers.ts         # tRPC procedure definitions (briefs.generate, briefs.list, etc.)
│   ├── db.ts              # Database query helpers
│   ├── storage.ts         # S3 file storage helpers
│   ├── briefs.test.ts     # Vitest tests for briefs router
│   └── _core/             # Framework plumbing (OAuth, LLM, context, etc.)
├── drizzle/               # Database schema & migrations
│   └── schema.ts          # Users and GTM briefs tables
├── shared/                # Shared types & constants
└── package.json
```

## Key Features

- **AI-Powered GTM Brief Generation** — Describe a product, get ICP, positioning, value propositions, channel messaging, and competitive differentiation in seconds
- **User Authentication** — OAuth integration with session management
- **Brief History** — Search and manage all generated briefs with filters
- **Sharing** — Generate unique shareable links for briefs (public access without auth)
- **PDF Export** — Export briefs to PDF and store in S3
- **Responsive Design** — Mobile-first design with dark elegant theme
- **Full-Stack Type Safety** — tRPC end-to-end types, Drizzle ORM with TypeScript

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui, Lucide icons, Framer Motion
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL/TiDB
- **AI**: LLM integration with structured JSON output (OpenAI compatible)
- **Storage**: AWS S3
- **Auth**: OAuth 2.0
- **Testing**: Vitest
- **Build**: Vite, esbuild

## Development

### Running Tests
```bash
pnpm test
```

All tests pass (10 total):
- Brief generation with LLM
- Brief list with auth
- Brief access control
- Share token generation
- PDF export
- Delete operations
- Auth logout

### Type Checking
```bash
pnpm check
```

### Building for Production
```bash
pnpm build
pnpm start
```

## Environment Variables

Create a `.env` file with the following variables:

```
# Database
DATABASE_URL=mysql://user:password@host/signal_gtm

# Auth & OAuth
JWT_SECRET=your-jwt-secret-key
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://auth-server.com
VITE_OAUTH_PORTAL_URL=https://portal.auth-server.com

# LLM & APIs
BUILT_IN_FORGE_API_URL=https://api.example.com
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Branding (optional)
VITE_APP_TITLE=Signal
VITE_APP_LOGO=https://your-logo-url.png
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### GTM Briefs Table
```sql
CREATE TABLE gtm_briefs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productName VARCHAR(255) NOT NULL,
  productDescription TEXT NOT NULL,
  industry VARCHAR(128),
  stage VARCHAR(64),
  icpData TEXT,
  positioningStatement TEXT,
  valuePropositions TEXT,
  channelMessaging TEXT,
  competitiveDiff TEXT,
  pdfUrl TEXT,
  shareToken VARCHAR(64) UNIQUE,
  isShared BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

## API Routes

All API routes are under `/api/trpc` and use tRPC for type-safe client-server communication.

### Briefs Router

- `briefs.generate` (protected) — Generate a new GTM brief from product description
  - Input: `{ productDescription, industry?, stage? }`
  - Output: `{ id, productName, icpData, positioningStatement, valuePropositions, channelMessaging, competitiveDiff, createdAt }`

- `briefs.list` (protected) — Get user's briefs with optional search
  - Input: `{ search?, limit?, offset? }`
  - Output: `{ briefs: GtmBrief[], total: number }`

- `briefs.getById` (protected) — Get brief by ID (only own briefs)
  - Input: `{ id }`
  - Output: `GtmBrief`

- `briefs.getByShareToken` (public) — Get brief by share token (no auth required)
  - Input: `{ shareToken }`
  - Output: `GtmBrief`

- `briefs.delete` (protected) — Delete a brief
  - Input: `{ id }`
  - Output: `{ success: boolean }`

- `briefs.toggleShare` (protected) — Enable/disable sharing
  - Input: `{ id, isShared }`
  - Output: `{ shareToken: string | null }`

- `briefs.exportPdf` (protected) — Export brief to PDF
  - Input: `{ id }`
  - Output: `{ url: string }`

## Landing Page Features

- **Hero Section** — Animated gradient headline, value proposition, CTA buttons
- **Problem Statement** — Time breakdown showing 18–35 hours vs. Signal's 30 seconds
- **Feature Showcase** — 5-column display of GTM brief output sections
- **Product Roadmap** — V1–V5 evolution with feature descriptions
- **Comparison Table** — Signal vs. ChatGPT, Jasper, Crayon, Notion AI
- **User Personas** — 5 personas (PMM, Consultant, Founder, Sales, Agency) with quotes
- **Responsive Navigation** — Mobile-friendly navbar with auth state

## App Features

- **Dashboard** — Welcome message, stats (briefs generated, products analyzed, channels covered), quick actions
- **New Brief** — Product description textarea, industry/stage selectors, example products for quick testing
- **Brief History** — Search briefs, filter by industry/stage, delete with confirmation
- **Brief Detail** — Full brief display with copy-to-clipboard buttons on each section
- **Sharing** — Toggle sharing, copy unique link, view public share page
- **Responsive** — Mobile sidebar with hamburger menu, touch-friendly UI

## Deployment

### Manus Hosting (Recommended)
The project is built for Manus hosting with built-in OAuth, LLM, and S3 integration.

### Self-Hosted / Other Platforms
1. Build: `pnpm build`
2. Start: `pnpm start`
3. Ensure all environment variables are set
4. Database must be accessible at `DATABASE_URL`
5. S3 credentials must be configured for file export

### Docker Deployment
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `pnpm test`
4. Run type check: `pnpm check`
5. Commit: `git commit -am 'Add my feature'`
6. Push: `git push origin feature/my-feature`
7. Create a pull request

## Code Quality

- **TypeScript**: Full type safety across frontend and backend
- **Testing**: Vitest with 10 passing tests covering core functionality
- **Linting**: Prettier for code formatting
- **Type Checking**: `npx tsc --noEmit` for compile-time safety

## File Organization Best Practices

- **Pages** (`client/src/pages/`) — Full-page components with routing
- **Components** (`client/src/components/`) — Reusable UI components
- **Hooks** (`client/src/hooks/`) — Custom React hooks
- **Contexts** (`client/src/contexts/`) — React context providers
- **Server** (`server/`) — Backend logic, routers, database queries
- **Shared** (`shared/`) — Shared types, constants, errors

## Performance Considerations

- **LLM Caching** — Consider caching brief generation results for identical product descriptions
- **Database Indexing** — Add indexes on `userId`, `shareToken`, and `createdAt` for faster queries
- **S3 Optimization** — Use CloudFront CDN for PDF downloads
- **Frontend Optimization** — Code splitting via Vite, lazy loading of pages

## Security

- **Auth**: OAuth 2.0 with JWT session cookies
- **CORS**: Configured for frontend origin
- **SQL Injection**: Protected via Drizzle ORM parameterized queries
- **XSS**: React escapes content by default, sanitize user input in LLM prompts
- **CSRF**: Session cookies are httpOnly and secure

## License

MIT

## Support & Issues

For issues, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include error logs and reproduction steps

## Roadmap

- [ ] Brief editing (regenerate individual sections)
- [ ] Launch type presets (new product, feature, repositioning)
- [ ] Team sharing and comments
- [ ] Churn analysis engine
- [ ] Competitive intelligence automation
- [ ] Launch timeline generator
