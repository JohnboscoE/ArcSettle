import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const DECISIONS = [
  {
    id: "INV-2026-031",
    decision: "PAY",
    amount: "$25.00",
    supplier: "AlMansoori Industrial",
    time: "0.8s",
    color: "#00C2A8",
  },
  {
    id: "INV-2026-032",
    decision: "HOLD",
    amount: "$0.00",
    supplier: "Riyadh Office Supplies",
    time: "1.1s",
    color: "#EF4444",
  },
  {
    id: "INV-2026-033",
    decision: "PARTIAL_PAY",
    amount: "$20.00",
    supplier: "Nile Tech Components",
    time: "0.9s",
    color: "#F59E0B",
  },
  {
    id: "INV-2026-034",
    decision: "PAY",
    amount: "$15.00",
    supplier: "Lagos Freight",
    time: "0.7s",
    color: "#00C2A8",
  },
  {
    id: "INV-2026-035",
    decision: "ESCALATE",
    amount: "$0.00",
    supplier: "Unknown Supplier",
    time: "1.2s",
    color: "#8888A0",
  },
  {
    id: "INV-2026-036",
    decision: "PAY",
    amount: "$30.00",
    supplier: "Karachi Steel Works",
    time: "0.8s",
    color: "#00C2A8",
  },
  {
    id: "INV-2026-037",
    decision: "HOLD",
    amount: "$0.00",
    supplier: "Dubai Trade Co.",
    time: "1.0s",
    color: "#EF4444",
  },
  {
    id: "INV-2026-038",
    decision: "PAY",
    amount: "$18.00",
    supplier: "Cairo Tech Supply",
    time: "0.6s",
    color: "#00C2A8",
  },
];

const FEATURES = [
  {
    icon: "◈",
    title: "Autonomous reasoning",
    desc: "The agent reasons through discrepancies, partial shipments, and duplicates — not just rule execution.",
  },
  {
    icon: "◎",
    title: "No wallet required",
    desc: "Circle Developer-Controlled Wallets let the agent sign and execute payments server-side. Zero friction for end users.",
  },
  {
    icon: "▦",
    title: "Real-time settlement",
    desc: "USDC transfers on Arc Testnet confirm in seconds with deterministic finality and dollar-denominated fees.",
  },
  {
    icon: "❖",
    title: "On-chain audit trail",
    desc: "Every decision, reasoning text, and settlement hash is logged on Arc — immutable and verifiable.",
  },
  {
    icon: "◉",
    title: "ERC-8004 agent identity",
    desc: "ArcSettle is registered as a verifiable onchain agent. Every payment is traceable to a known, auditable identity.",
  },
  {
    icon: "▣",
    title: "Five decision modes",
    desc: "PAY, PARTIAL_PAY, HOLD, ESCALATE, or PENDING — the agent picks the right action for every scenario.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Invoice ingested",
    desc: "Upload a PDF or submit via API. The system parses supplier, amount, PO reference, and line items.",
  },
  {
    num: "02",
    title: "PO matched",
    desc: "Fuzzy matching finds the right purchase order. Discrepancies in amount, currency, or delivery status are flagged.",
  },
  {
    num: "03",
    title: "Agent reasons",
    desc: "The AI agent analyzes the invoice, PO, and all discrepancies. It writes human-readable reasoning and makes a decision.",
  },
  {
    num: "04",
    title: "USDC settled",
    desc: "For PAY or PARTIAL_PAY decisions, USDC transfers on Arc Testnet immediately. The tx hash is logged on-chain.",
  },
];

const TECH = [
  { label: "Arc Testnet", sub: "L1 blockchain" },
  { label: "USDC", sub: "Settlement currency" },
  { label: "Circle Wallets", sub: "Dev-controlled" },
  { label: "ERC-8004", sub: "Agent identity" },
  { label: "Claude AI", sub: "Reasoning layer" },
  { label: "ERC-8183", sub: "Job lifecycle" },
];

const AgentFeed: React.FC = () => {
  const [items, setItems] = useState(DECISIONS.slice(0, 4));
  useEffect(() => {
    let idx = 4;
    const interval = setInterval(() => {
      const next = DECISIONS[idx % DECISIONS.length];
      setItems((prev) => [next, ...prev.slice(0, 3)]);
      idx++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "#0A0D14",
        border: "0.5px solid #1E2433",
        borderRadius: 12,
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Terminal header */}
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "0.5px solid #1E2433",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#EF4444",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#F59E0B",
          }}
        />
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#22C55E",
          }}
        />
        <span
          style={{
            marginLeft: 8,
            fontSize: 11,
            color: "#555570",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          arcsettle-agent · live
        </span>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#22C55E",
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#22C55E",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            processing
          </span>
        </div>
      </div>

      {/* Feed */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: 200,
        }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 12px",
              background: i === 0 ? "#0D1520" : "transparent",
              borderRadius: 6,
              transition: "all 0.3s ease",
              border:
                i === 0 ?
                  `0.5px solid ${item.color}22`
                : "0.5px solid transparent",
              opacity: i === 0 ? 1 : 1 - i * 0.15,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "JetBrains Mono, monospace",
                color: item.color,
                background: `${item.color}15`,
                padding: "2px 8px",
                borderRadius: 3,
                minWidth: 90,
                textAlign: "center",
              }}
            >
              {item.decision}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#8888A0",
                fontFamily: "JetBrains Mono, monospace",
                minWidth: 60,
              }}
            >
              {item.id}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#F0F0F5",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.supplier}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: item.color,
                fontFamily: "JetBrains Mono, monospace",
                minWidth: 55,
                textAlign: "right",
              }}
            >
              {item.amount}
            </span>
            <span
              style={{
                fontSize: 10,
                color: "#555570",
                fontFamily: "JetBrains Mono, monospace",
                minWidth: 30,
                textAlign: "right",
              }}
            >
              {item.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        background: "#0F1117",
        color: "#F0F0F5",
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(15,17,23,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "0.5px solid #1E2433" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              background: "#00C2A8",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              color: "#003830",
            }}
          >
            A
          </div>
          <span style={{ fontSize: 15, fontWeight: 600 }}>ArcSettle</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="https://github.com/JohnboscoE/arcsettle"
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 13, color: "#8888A0", textDecoration: "none" }}
          >
            GitHub
          </a>
          <button
            onClick={() => navigate("/invoices")}
            style={{
              background: "#00C2A8",
              color: "#003830",
              border: "none",
              padding: "7px 18px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Launch app →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{ padding: "140px 24px 80px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 28,
              background: "#0D3D30",
              border: "0.5px solid #00C2A820",
              fontSize: 12,
              color: "#00C2A8",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#00C2A8",
                animation: "pulse-dot 2s ease-in-out infinite",
              }}
            />
            Agentic Economy Track · Stablecoin Commerce Stack Challenge
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 72px)",
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Invoices settled
            <br />
            <span style={{ color: "#00C2A8" }}>autonomously.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "#8888A0",
              maxWidth: 560,
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            ArcSettle is an AI agent that matches invoices against purchase
            orders, reasons through discrepancies, and executes USDC payments on
            Arc — no human approval required.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => navigate("/invoices")}
              style={{
                background: "#00C2A8",
                color: "#003830",
                border: "none",
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Launch app →
            </button>
            <a
              href="https://testnet.arcscan.app/address/0x28c4c43bb4f3aed14901b90a7c8ef33354198ede"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "transparent",
                color: "#00C2A8",
                border: "0.5px solid #00C2A8",
                padding: "12px 28px",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              View on Arc ↗
            </a>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "#1E2433",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 48,
          }}
        >
          {[
            { value: "< 2s", label: "Avg settlement time" },
            { value: "5", label: "Decision types" },
            { value: "100%", label: "Autonomous — no wallet needed" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#161B27",
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#00C2A8",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "#8888A0", marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Agent feed */}
        <AgentFeed />
      </section>

      {/* How it works */}
      <section style={{ padding: "80px 24px", background: "#0C0E14" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                color: "#555570",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              How it works
            </div>
            <h2
              style={{
                fontSize: "clamp(24px, 4vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              From invoice to settlement
              <br />
              in four steps
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 1,
              background: "#1E2433",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                style={{
                  background: "#161B27",
                  padding: "32px 24px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#00C2A8",
                    marginBottom: 16,
                    opacity: 0.6,
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 10,
                    color: "#F0F0F5",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{ fontSize: 13, color: "#8888A0", lineHeight: 1.6 }}
                >
                  {step.desc}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      position: "absolute",
                      right: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#2A2A38",
                      fontSize: 18,
                      zIndex: 1,
                      display: "none",
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}
      >
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "#555570",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Features
          </div>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Built for autonomous finance
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "#161B27",
                border: "0.5px solid #1E2433",
                borderRadius: 12,
                padding: "24px",
                transition: "border-color 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#00C2A830")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#1E2433")
              }
            >
              <div style={{ fontSize: 20, marginBottom: 14, color: "#00C2A8" }}>
                {f.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, color: "#8888A0", lineHeight: 1.6 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section style={{ padding: "80px 24px", background: "#0C0E14" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "#555570",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Built on
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginBottom: 60,
            }}
          >
            {TECH.map((t) => (
              <div
                key={t.label}
                style={{
                  background: "#161B27",
                  border: "0.5px solid #1E2433",
                  borderRadius: 10,
                  padding: "12px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#F0F0F5" }}
                >
                  {t.label}
                </div>
                <div style={{ fontSize: 11, color: "#555570", marginTop: 2 }}>
                  {t.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Agent TX proof */}
          <div
            style={{
              background: "#0A0D14",
              border: "0.5px solid #1E2433",
              borderRadius: 12,
              padding: "20px 24px",
              display: "inline-block",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#555570",
                marginBottom: 8,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              // agent registration · Arc Testnet
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                color: "#8888A0",
              }}
            >
              TX:{" "}
              <a
                href="https://testnet.arcscan.app/tx/0xd217c9a4d7ca7203ab3fd0478997ee4df145ad91555445fc5177d9f264526eb4"
                target="_blank"
                rel="noreferrer"
                style={{ color: "#00C2A8" }}
              >
                0xd217c9a4…526eb4 ↗
              </a>
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "JetBrains Mono, monospace",
                color: "#8888A0",
                marginTop: 4,
              }}
            >
              ERC-8004 · registered onchain identity
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "100px 24px",
          maxWidth: 700,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          Ready to see the
          <br />
          <span style={{ color: "#00C2A8" }}>agent in action?</span>
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "#8888A0",
            marginBottom: 36,
            lineHeight: 1.7,
          }}
        >
          Submit an invoice, watch the agent reason through it in real time, and
          see USDC settle on Arc — all without connecting a wallet.
        </p>
        <button
          onClick={() => navigate("/invoices")}
          style={{
            background: "#00C2A8",
            color: "#003830",
            border: "none",
            padding: "14px 36px",
            borderRadius: 10,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Launch ArcSettle →
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "0.5px solid #1E2433",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 12, color: "#555570" }}>
          ArcSettle · Built for the Stablecoin Commerce Stack Challenge 2026 ·{" "}
          <a
            href="https://github.com/JohnboscoE/arcsettle"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#8888A0" }}
          >
            GitHub
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        body { margin: 0; overflow-x: hidden; }
      `}</style>
    </div>
  );
};

export default Landing;
