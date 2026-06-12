  # ArcSettle

**Autonomous B2B Invoice Settlement on Arc**

ArcSettle is an AI-powered invoice settlement agent that autonomously matches invoices against purchase orders, reasons through discrepancies, and executes USDC payments on Arc Testnet via Circle Developer-Controlled Wallets — no user wallet connection required.

Built for the **Stablecoin Commerce Stack Challenge** · Track 4: Best Agentic Economy Experience on Arc.

---

## Live Demo

- **Agent registration TX:** https://testnet.arcscan.app/tx/0xd217c9a4d7ca7203ab3fd0478997ee4df145ad91555445fc5177d9f264526eb4
- **Sample settlement TX:** https://testnet.arcscan.app/tx/0x35acffc613d980a2090b9fc35d93c5b2083f3eae7a64fc8e62fc5f70450923e0
- **Buyer wallet:** https://testnet.arcscan.app/address/0x28c4c43bb4f3aed14901b90a7c8ef33354198ede

---

## How It Works

```
Invoice uploaded
      ↓
PO Matcher — fuzzy match against PO register
      ↓
AI Agent — reasons through discrepancies
      ↓
Decision: PAY | PARTIAL_PAY | HOLD | ESCALATE
      ↓
Circle Wallets — USDC transfer on Arc Testnet
      ↓
On-chain audit log
```

The agent handles ambiguity that simple rules cannot:
- **PAY** — clean match, full settlement executed
- **PARTIAL_PAY** — invoice exceeds PO, settles authorized amount only
- **HOLD** — delivery unconfirmed or duplicate invoice detected
- **ESCALATE** — no PO match, requires human review

---

## Circle Products Used

| Product | Purpose |
|---|---|
| USDC | Settlement currency for all invoice payments |
| Developer-Controlled Wallets | Server-side key management — agent executes payments autonomously |
| ERC-8004 Agent Identity | Onchain registration of ArcSettle as a verifiable AI agent |
| Arc Testnet | L1 blockchain with deterministic finality |

---

## Project Structure

```
arcsettle/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── data/
│   │   │   ├── seed.ts         # Suppliers and PO seed data
│   │   │   └── store.ts        # Persistent JSON store
│   │   ├── routes/
│   │   │   ├── invoices.ts     # Invoice upload and management
│   │   │   ├── pos.ts          # Purchase order register
│   │   │   ├── agent.ts        # Agent processing and logs
│   │   │   ├── settlement.ts   # Full pipeline trigger
│   │   │   └── dashboard.ts    # Summary stats
│   │   ├── services/
│   │   │   ├── agentService.ts     # AI reasoning layer
│   │   │   ├── circleService.ts    # Circle Wallets + USDC settlement
│   │   │   ├── invoiceParser.ts    # PDF/JSON invoice parsing
│   │   │   └── poMatcher.ts        # Fuzzy PO matching + discrepancy detection
│   │   ├── scripts/
│   │   │   ├── setupWallets.ts     # One-time wallet creation on Arc
│   │   │   └── registerAgent.ts    # ERC-8004 agent registration
│   │   └── types/
│   │       └── index.ts            # Shared TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/                   # React + TypeScript dashboard
    ├── src/
    │   ├── api/                # API client
    │   ├── components/         # Shared UI components
    │   ├── pages/
    │   │   ├── Dashboard.tsx   # Metrics + recent activity
    │   │   ├── Invoices.tsx    # Invoice queue + agent trigger
    │   │   ├── PORegister.tsx  # Purchase order register
    │   │   ├── Settlements.tsx # On-chain settlement history
    │   │   └── AgentLogs.tsx   # Agent decisions + reasoning
    │   └── types/
    └── package.json
```

---

## Setup

### Prerequisites

- Node.js 18+
- Circle developer account — [console.circle.com](https://console.circle.com/signup)
- Arc Testnet USDC — [faucet.circle.com](https://faucet.circle.com)
- Anthropic API key (optional — mock mode available without it)

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
PORT=4000
FRONTEND_URL=http://localhost:5173
CIRCLE_API_KEY=TEST_API_KEY:your-key-here
CIRCLE_ENTITY_SECRET=your-entity-secret-here
ANTHROPIC_API_KEY=your-anthropic-key-here   # optional
```

Run one-time setup (creates wallets + registers agent on Arc):

```bash
npm run setup-wallets    # creates 6 wallets on Arc Testnet
                         # fund buyer wallet at faucet.circle.com
npm run register-agent   # registers ArcSettle on ERC-8004
```

Start the backend:

```bash
npm run dev              # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/invoices/manual` | Create invoice from JSON |
| POST | `/api/invoices/upload` | Upload PDF invoice |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/pos` | List purchase orders |
| POST | `/api/settlement/process/:id` | Run agent + settle invoice |
| GET | `/api/settlement` | Settlement history |
| GET | `/api/settlement/balances` | Wallet USDC balances |
| GET | `/api/agent/logs` | All agent decisions |
| GET | `/api/dashboard` | Summary stats |

---

## Demo Scenarios

Five invoice scenarios demonstrate the full agent reasoning range:

```bash
# Scenario 1 — Clean match → PAY
curl -X POST http://localhost:4000/api/invoices/manual \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"sup-001","invoiceNumber":"INV-001","amount":25,"currency":"USD","poReference":"PO-2026-001","issueDate":"2026-06-01","dueDate":"2026-06-30","items":[]}'

# Scenario 2 — Amount over PO → PARTIAL_PAY
curl -X POST http://localhost:4000/api/invoices/manual \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"sup-002","invoiceNumber":"INV-002","amount":24,"currency":"USD","poReference":"PO-2026-002","issueDate":"2026-06-01","dueDate":"2026-07-01","items":[]}'

# Scenario 3 — Clean match → PAY
curl -X POST http://localhost:4000/api/invoices/manual \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"sup-003","invoiceNumber":"INV-003","amount":15,"currency":"USD","poReference":"PO-2026-003","issueDate":"2026-06-01","dueDate":"2026-06-15","items":[]}'

# Scenario 4 — Unconfirmed delivery → HOLD
curl -X POST http://localhost:4000/api/invoices/manual \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"sup-005","invoiceNumber":"INV-004","amount":18,"currency":"USD","poReference":"PO-2026-005","issueDate":"2026-06-01","dueDate":"2026-07-05","items":[]}'

# Scenario 5 — No PO match → ESCALATE
curl -X POST http://localhost:4000/api/invoices/manual \
  -H "Content-Type: application/json" \
  -d '{"supplierId":"sup-001","invoiceNumber":"INV-005","amount":999,"currency":"USD","poReference":"PO-UNKNOWN-999","issueDate":"2026-06-01","dueDate":"2026-06-20","items":[]}'
```

Process each invoice after creation:
```bash
curl -X POST http://localhost:4000/api/settlement/process/<invoice-id>
```

---

## Circle Product Feedback

### Why we chose these products
Developer-Controlled Wallets were the key unlock for the agentic use case. Autonomous settlement requires the agent to hold and execute payments without human signing — user-controlled wallets break the autonomy loop. Circle's server-side key management is the only architecture that makes this work cleanly.

ERC-8004 agent identity registration gave ArcSettle a verifiable onchain presence. For enterprise B2B use cases, knowing that a payment was executed by a registered, auditable agent is a meaningful trust signal.

### What worked well
- Developer-Controlled Wallets SDK (TypeScript) was clean and well-typed
- Arc Testnet faucet was easy to use and funded quickly
- Transaction polling via `getTransaction` was reliable
- Arc's deterministic finality meant settlements confirmed within seconds

### What could be improved
- USDC contract address for Arc Testnet was not prominently documented — required trial and error to find `0x3600000000000000000000000000000000000000`
- ERC-8183 `setBudget` requires the provider wallet to have gas, which isn't obvious from the docs
- `createTransaction` API uses `walletAddress` not `walletId` — inconsistent with other SDK methods
- Sandbox rate limits are not documented

---

## Built With

- [Arc Testnet](https://docs.arc.io) — L1 blockchain for stablecoin applications
- [Circle Developer-Controlled Wallets](https://developers.circle.com) — server-side key management
- [USDC](https://developers.circle.com/stablecoins/usdc) — settlement currency
- [Anthropic Claude](https://anthropic.com) — AI reasoning layer
- Express + TypeScript — backend API
- React + Vite — frontend dashboard

---

## License

MIT