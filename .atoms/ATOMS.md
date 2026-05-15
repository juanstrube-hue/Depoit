# Project Context

## Project Overview
Depoit is a Chilean fintech web application for rental deposit custody management. It enables landlords, tenants, and brokers to manage rental contracts, track deposits through a secure custody lifecycle, handle deposit returns with deductions, and receive notifications. The platform uses dual state machines (contract status + deposit status) to model the full lifecycle from contract creation through deposit return.

## Key Decisions
| Date | Decision | By | Rationale |
|------|----------|-----|-----------|
| 2026-05-11 | Use React + TypeScript + Vite + shadcn/ui for frontend | Alex | Modern stack with strong typing and component library |
| 2026-05-11 | Use FastAPI + SQLAlchemy + PostgreSQL for backend | Alex | Async Python backend with robust ORM |
| 2026-05-12 | Implement dual state machines (contract_status + deposit_status) | Alex | Contracts and deposits have independent lifecycles that need separate tracking |
| 2026-05-12 | Use Atoms Cloud backend with custom API routers | Alex | Integrated auth, database, and edge functions |
| 2026-05-12 | Contract events table for dynamic timeline | Alex | Audit trail of all actions taken on a contract |
| 2026-05-12 | Deposit deductions table for return process | Alex | Track itemized deductions with evidence during return review |

## Constraints
- Color Scheme: Emerald/green accents (#10B981), dark text (#1E293B), light backgrounds (#F8FAFC), muted text (#64748B)
- Typography: System font stack (Inter via Tailwind defaults)
- Layout: Sidebar navigation on desktop, responsive mobile layout
- Auth: Atoms Cloud authentication (email/password + Google OAuth planned)
- Language: Spanish (Chilean market) for all UI text
- Currency: Chilean Pesos (CLP) formatted with dot separators
- Contract Status Flow: draft → pending_signatures → signed → active → finished → closed
- Deposit Status Flow: pending_deposit → deposited → in_custody → return_review → returned/partially_returned/disputed