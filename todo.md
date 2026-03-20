# Signal GTM — Project TODO

## Design System & Infrastructure
- [x] Global CSS variables, color palette (dark elegant theme), typography
- [x] Google Fonts integration (Inter + DM Serif Display)
- [x] Database schema: gtm_briefs table with all fields
- [x] tRPC router setup for briefs, generate, share, export

## Landing Page
- [x] Navbar with logo, nav links, CTA button, auth state
- [x] Hero section with headline, subheadline, CTA, animated visual
- [x] Problem statement section with time breakdown
- [x] Feature showcase: 5-column output table (ICP, Positioning, Value Props, Messaging, Competitive Diff)
- [x] Product roadmap V1–V5 section
- [x] Comparison table: Signal vs ChatGPT/Jasper/Crayon/Notion AI
- [x] User personas section (5 personas with quotes)
- [x] CTA footer section

## GTM Brief Generator App
- [x] Dashboard layout with sidebar (Dashboard, New Brief, My Briefs)
- [x] App dashboard with stats and quick actions
- [x] New Brief: product description input form with industry/stage selectors
- [x] Example briefs (Signal, Notion, Figma) for quick testing
- [x] AI generation loading state with progress indicators
- [x] Structured output display: ICP, Positioning, Value Props, Channel Messaging, Competitive Diff
- [x] Brief detail view with all sections rendered beautifully
- [x] Copy-to-clipboard buttons on each messaging section
- [x] Mobile-responsive sidebar with hamburger menu

## AI & Backend
- [x] LLM integration: structured JSON schema for GTM brief generation
- [x] tRPC procedure: generate (protected, calls LLM with structured output)
- [x] tRPC procedure: list (protected, list user's briefs)
- [x] tRPC procedure: getById (protected for own)
- [x] tRPC procedure: getByShareToken (public for shared)
- [x] tRPC procedure: delete (protected)
- [x] tRPC procedure: toggleShare (enable/disable sharing)
- [x] tRPC procedure: exportPdf (stores export data in S3)

## Brief History & Management
- [x] Brief history list with search
- [x] Brief card with product name, date, industry, stage badges
- [x] Delete brief functionality (hover to reveal)

## Export & Sharing
- [x] Export: generate JSON export, store in S3, return URL
- [x] Share via unique link: generate nanoid share token, store in DB
- [x] Public share page: view brief without auth via share link
- [x] Copy share link to clipboard
- [x] Disable sharing toggle

## Tests
- [x] Vitest: brief list procedure test (auth + unauth)
- [x] Vitest: getById with access control test
- [x] Vitest: getByShareToken public access test
- [x] Vitest: generate brief test with LLM mock
- [x] Vitest: delete brief test
- [x] Vitest: exportPdf test with S3 mock
- [x] Vitest: auth.logout test (existing)
