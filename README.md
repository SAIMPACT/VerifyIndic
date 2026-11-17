# VerifyIndic — React + TypeScript Authentication App

VerifyIndic is a verification API prototype for Indian languages (starting with Hindi), helping lending apps, fintechs, and gig platforms spot deepfake voice clones and manipulated ID documents.

This repository contains the migrated **React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui** application in the `verifyindic-app/` directory, while preserving the original static HTML/CSS/JS source in `backup-original/`.

For production authentication and deployment, start with [GO-LIVE.md](GO-LIVE.md). Do not open the legacy root-level `index.html` as the live app; use `npm run dev` or deploy through Vercel.

---

## Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Routing**: React Router v7 (`/` for Landing Page, `/dashboard` for Dashboard with `#last`, `#history`, `#billing`, `#keys`, `#docs` tabs)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom design tokens (`--navy`, `--teal`, etc.)
- **UI Components**: shadcn/ui primitives (`Button`, `Card`, `Input`, `Table`, `Tabs`, `Dialog`)
- **Icons**: Lucide React
- **Design Fidelity**: Exact preservation of fonts (Inter + JetBrains Mono), responsive breakpoints, colors, signal meters, and interactive waveforms.

---

## Project Structure

```
verifyindic/
├── backup-original/          # Preserved backup of original vanilla source code
│   ├── index.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
├── verifyindic-app/          # Migrated React + TypeScript + Vite application
│   ├── components.json       # shadcn/ui configuration
│   ├── vite.config.ts        # Vite configuration with Tailwind CSS v4 plugin & @ alias
│   ├── tsconfig.json         # TypeScript configuration
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Shared Brand, Navbar, Footer, Pill, SignalItem, Waveform
│   │   │   ├── landing/      # Hero, Problem, HowItWorks, SampleResult, Languages, Trust, Pricing, AccessForm
│   │   │   ├── dashboard/    # Header, LastCallTab, CallHistoryTab, BillingTab, ApiKeysTab, DocsTab, PlanPanel
│   │   │   └── ui/           # shadcn Button, Card, Input, Table, Tabs, Dialog
│   │   ├── config/
│   │   │   └── appConfig.ts  # Typed configuration (plans, languages, GST)
│   │   ├── data/
│   │   │   └── mockData.ts   # Typed mock calls, invoices, keys, and level() scoring helper
│   │   ├── hooks/
│   │   │   └── useToast.tsx  # Toast notification hook and provider
│   │   ├── lib/
│   │   │   ├── auth.tsx      # Supabase session provider
│   │   │   ├── formatters.ts # Formatting helpers (INR currency, duration, date/time, CSV export)
│   │   │   └── utils.ts      # Class merging utility (clsx + tailwind-merge)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Complete landing page
│   │   │   └── DashboardPage.tsx # Hash-routed dashboard view
│   │   ├── types/
│   │   │   └── index.ts      # Explicit TypeScript interfaces and types
│   │   ├── App.tsx           # App root with Router and ToastProvider
│   │   ├── main.tsx          # React DOM entry point
│   │   └── index.css         # Tailwind v4 import, design tokens, and components
│   └── package.json
├── package.json              # Root package with proxy scripts (npm run dev / npm run build)
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 22
- npm >= 9

### Installation

From the project root:

```bash
cd verifyindic-app
npm install
```

Or from the root directory:

```bash
npm --prefix verifyindic-app install
```

### Development Server

Run the development server locally:

```bash
# From the project root
npm run dev

# Or directly in verifyindic-app
cd verifyindic-app
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- **Landing Page**: `http://localhost:5173/`
- **Dashboard**: `http://localhost:5173/dashboard`
- **Direct Tab Links**:
  - `http://localhost:5173/dashboard#last` (Last call analysis)
  - `http://localhost:5173/dashboard#history` (Call history with search/filter/export)
  - `http://localhost:5173/dashboard#billing` (Billing and invoices)
  - `http://localhost:5173/dashboard#keys` (API key generation and revocation)
  - `http://localhost:5173/dashboard#docs` (Quickstart and signal definitions)

### Building for Production

Compile TypeScript and build the optimized production assets:

```bash
# From project root
npm run build

# Or in verifyindic-app
cd verifyindic-app
npm run build
```

The output bundle is generated in `verifyindic-app/dist/`.

### Previewing the Production Build

```bash
npm run preview
# or cd verifyindic-app && npm run preview
```

---

## Key Features & Preserved Behaviors

1. **Brand & Visuals**:
   - Matches original navy (`#0f1a2e`), teal (`#2dd4bf`), and off-white background (`#faf9f7`) palette.
   - Mobile-first responsiveness across mobile, tablet, and desktop viewports.
2. **Interactive Audio Waveform Player**:
   - Seeded waveform generation for deterministic, realistic voice audio visualization.
   - Play/pause audio player simulation with sweeping progress indicators and time readout.
3. **Early Access Form**:
   - Client-side validation for name, email address, company, and use case.
   - Accessible ARIA attributes (`aria-invalid`, `aria-describedby`, `aria-live`).
4. **Call History & Analytics**:
   - Real-time search by Call ID.
   - Filtering by Risk Level (Low concern, Review, Elevated risk).
   - Sorting by newest, oldest, or highest risk.
   - One-click CSV export (`verifyindic_calls.csv`).
   - Clicking any call row navigates directly to the Last Call analysis view for that call.
5. **API Key Management**:
   - In-memory creation of secure test keys (`vi_test_...`) with one-time copy banner.
   - Revoke confirmation workflow with status indicators.
6. **Invoices**:
   - Single-call invoice download and monthly invoice downloads (`.txt`).
7. **Workspace sign-in**
   - Sign in at `/login` with an account provisioned by the administrator.
   - `/dashboard` loads call records for the signed-in user’s workspace. See [HANDOFF.md](HANDOFF.md) for preview setup.
# VerifyIndic
# VerifyIndic
