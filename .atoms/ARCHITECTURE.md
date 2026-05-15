# Architecture Design

## System Overview
Depoit is a full-stack web application with a React frontend and FastAPI backend, connected via REST APIs. The backend uses Atoms Cloud for authentication, PostgreSQL database, and object storage. The frontend is a single-page application with client-side routing and protected routes behind authentication.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, React Hook Form, Zod
- **Backend**: Python, FastAPI, SQLAlchemy (async), PostgreSQL, Atoms Cloud SDK
- **Auth**: Atoms Cloud authentication (JWT-based)
- **Storage**: Atoms Cloud object storage for evidence files
- **Deployment**: Atoms Cloud platform

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Auth | User authentication, session management | contexts/AuthContext.tsx, routers/auth.py |
| Contracts | Contract CRUD, lifecycle management | pages/Contracts.tsx, ContractDetail.tsx, ContractNew.tsx, routers/contracts.py, services/contracts.py |
| Contract Events | Timeline event tracking | models/contract_events.py, routers/contract_events.py |
| Deposit Management | Deductions, returns | models/deposit_deductions.py, deposit_returns.py, routers/ |
| Dashboard | Metrics aggregation, overview | pages/Dashboard.tsx |
| Notifications | User alerts and updates | pages/Notifications.tsx, models/notifications.py |
| Wallet | Financial overview | pages/Wallet.tsx |
| Layout | Navigation, sidebar, responsive shell | components/Layout.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | TanStack Query + Context | Server state via React Query, auth state via Context |
| Form handling | React Hook Form + Zod | Type-safe validation with good DX |
| Styling | Tailwind + shadcn/ui | Utility-first with accessible component primitives |
| API client | Fetch wrapper with auth headers | Simple, no extra dependencies |
| Routing | React Router v6 | Standard SPA routing with protected routes |
| Backend ORM | SQLAlchemy async | Full async support with PostgreSQL |
| Dual state machines | Separate columns | Independent lifecycle tracking for contracts and deposits |

## File Tree Plan
```
app/
├── backend/
│   ├── core/              # Database config, settings
│   ├── models/            # SQLAlchemy ORM models
│   │   ├── contracts.py
│   │   ├── contract_events.py
│   │   ├── deposit_deductions.py
│   │   ├── deposit_returns.py
│   │   ├── notifications.py
│   │   └── user_profiles.py
│   ├── routers/           # FastAPI route handlers
│   │   ├── contracts.py
│   │   ├── contract_events.py
│   │   ├── deposit_deductions.py
│   │   ├── deposit_returns.py
│   │   └── notifications.py
│   ├── services/          # Business logic layer
│   │   └── contracts.py
│   ├── schemas/           # Pydantic validation schemas
│   └── main.py            # App entry point
└── frontend/
    ├── src/
    │   ├── pages/         # Route-level page components
    │   │   ├── Dashboard.tsx
    │   │   ├── Contracts.tsx
    │   │   ├── ContractDetail.tsx
    │   │   ├── ContractNew.tsx
    │   │   ├── Returns.tsx
    │   │   ├── Notifications.tsx
    │   │   └── Wallet.tsx
    │   ├── components/    # Shared UI components
    │   │   └── Layout.tsx
    │   ├── contexts/      # React contexts (Auth)
    │   ├── lib/           # Utilities, API client
    │   │   ├── api.ts
    │   │   └── utils.ts
    │   ├── types/         # TypeScript type definitions
    │   └── App.tsx        # Root component with routing
    └── package.json
```

## Implementation Guide
1. **Authentication**: Uses Atoms Cloud auth with JWT tokens stored in context. Protected routes redirect to /login if unauthenticated.
2. **Contract Lifecycle**: Dual state machines tracked via `contract_status` and `deposit_status` columns. Each state transition triggers a contract event for the timeline.
3. **API Pattern**: Frontend uses a centralized API client (`lib/api.ts`) that auto-attaches auth headers. Backend routers handle CRUD with user_id scoping.
4. **Event Sourcing (lite)**: Contract events table records all actions (creation, signing, deposit confirmation, etc.) with actor info for audit trail.
5. **Deductions**: During return_review phase, landlord can propose deductions with evidence. Tenant can accept or dispute.