## Design

**Design References**: Stripe, Mercury, Linear, Ramp, Notion
**Color Palette**: 
- Primary: #0F172A (dark navy), #1E293B (slate)
- Accent: #10B981 (trust-green), #059669 (green-dark)
- Background: #FFFFFF, #F8FAFC (light gray)
- Text: #0F172A (primary), #64748B (secondary)
- Borders: #E2E8F0 (soft gray)
- Status colors: #FCD34D (pending), #10B981 (active), #3B82F6 (in process), #EF4444 (rejected)

**Typography**: Inter font family, clean hierarchy
**Key Component Styles**: Soft borders (rounded-xl), light shadows, large white spaces, modern cards with hover states, status badges with colored dots

## Images to Generate
- hero-logo-depoit.png: Depoit logo mark - modern shield/vault icon in trust-green
- hero-illustration-custody.png: Abstract illustration of secure digital custody concept
- empty-state-contracts.png: Friendly empty state illustration for no contracts
- empty-state-wallet.png: Empty state illustration for wallet/funds

## Development Tasks

- [x] Set up database tables (users_profiles, contracts, deposits, deposit_returns, deposit_deductions, contract_events, notifications)
- [x] Insert Chilean demo/mock data
- [x] Create frontend auth flow with login page and role selection
- [x] Build main layout with sidebar navigation (Dashboard, Contracts, Deposit Returns, Wallet, Activity, Settings, Admin)
- [x] Build Landlord Dashboard with metrics cards and contracts table
- [x] Build Tenant Dashboard with active deposits and status
- [x] Build Broker Dashboard with managed contracts overview
- [ ] Build Contract Creation 5-step wizard flow
- [x] Build Contract Detail page with tabs (Overview, Timeline, Wallet, Deductions, Returns, Documents, Participants)
- [x] Build Deposit Returns flow page
- [x] Build Deposit Deductions with evidence upload
- [x] Build Notifications system (bell icon dropdown)
- [ ] Build Admin Panel with overview metrics
- [x] Polish UI - responsive design, loading states, transitions, premium fintech feel