# Requirements & Progress

## Requirements Overview
Build a deposit custody management platform (Depoit) for Chilean rental contracts with:
- User authentication (email + Google OAuth)
- Contract creation wizard with multi-step form
- Dual state machine lifecycle (contract status + deposit status)
- Contract detail page as operational center with action buttons
- Dynamic timeline of contract events
- Deposit deduction tracking during return process
- Dashboard with financial metrics
- Notifications system
- Wallet/financial overview

## User Stories
- As a landlord, I can create a contract and invite a tenant to sign
- As a tenant, I can sign a contract digitally
- As a landlord, I can confirm deposit receipt and activate custody
- As either party, I can view the contract timeline and current status
- As a landlord, I can initiate deposit return with optional deductions
- As a tenant, I can review and dispute proposed deductions
- As any user, I can see my dashboard with active contracts and financial metrics

## Task Breakdown
- [x] Initial project setup (frontend + backend scaffolding)
- [x] Authentication system (login, register, auth context)
- [x] Dashboard page with metrics cards
- [x] Contracts list page with filtering
- [x] Contract creation wizard (multi-step form)
- [x] Contract detail page as operational center
- [x] Dual state machines (contract_status + deposit_status)
- [x] Dynamic timeline with contract events
- [x] Deposit deductions model and API
- [x] Action buttons per state transition
- [x] Participant signature status display
- [x] Landing page (Index)
- [ ] Google OAuth integration
- [ ] Discount/deduction proposals workflow
- [ ] Notifications real-time updates
- [ ] Wallet page with transaction history

## Progress Log
- 2026-05-11 | Initial project setup complete (frontend + backend scaffolding, auth, basic pages)
- 2026-05-12 | Added new features and UI improvements (Dashboard, Contracts list, Returns, Notifications pages)
- 2026-05-12 | Implemented Contract Creation wizard with multi-step form
- 2026-05-12 | Refined contract creation wizard (validation, UX improvements)
- 2026-05-12 | Fixed contract creation 422 bug (field mapping issue)
- 2026-05-12 | Completed contract lifecycle management (dual state machines, timeline events, action buttons, operational center)