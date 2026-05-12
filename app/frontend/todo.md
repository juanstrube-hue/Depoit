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
**Key Component Styles**: Soft borders (rounded-xl), light shadows, large white spaces, modern cards with hover states, status badges with colored dots, premium fintech feel

## Contract Lifecycle State Machines

### Contract Status: draft → pending_signatures → signed → active → finished → closed
### Deposit Status: pending_deposit → deposited → in_custody → return_review → partially_returned | returned | disputed

### Valid Transitions (contract_status):
- draft → pending_signatures (when creator submits)
- pending_signatures → signed (when both parties sign)
- signed → active (when deposit is received / in_custody)
- active → finished (when contract end date reached or manual termination)
- finished → closed (after deposit fully returned)

### Valid Transitions (deposit_status):
- pending_deposit → deposited (payment confirmed)
- deposited → in_custody (funds verified in custody account)
- in_custody → return_review (contract finished, return initiated)
- return_review → returned (full return)
- return_review → partially_returned (with deductions)
- return_review → disputed (disagreement on deductions)

## Development Tasks

- [x] Set up database tables (contract_status, deposit_status, signed_by_landlord, signed_by_tenant added)
- [x] Update TypeScript types to include new fields
- [x] Update utils.ts with new status labels, colors, dots, and transition validation helpers
- [x] Fix ContractNew.tsx to send contract_status='pending_signatures', deposit_status='pending_deposit', signed_by_landlord/tenant
- [x] Rewrite ContractDetail.tsx as operational center: dual status display, action buttons per state, dynamic timeline
- [x] Update Dashboard.tsx to use contract_status and deposit_status for metrics
- [x] Update Contracts.tsx list to show dual statuses and filter by contract_status
- [x] Lint and build verification