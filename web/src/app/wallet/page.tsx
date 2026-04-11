import { MOCK_ROLE, getTheme } from "@/lib/mock-role";
import { MOCK_TRANSACTIONS } from "@/lib/mock-data";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

const MOCK_BALANCE = 1200;

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function WalletPage() {
  const t = getTheme(MOCK_ROLE);
  const Nav = MOCK_ROLE === "client" ? ClientNav : InsiderNav;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
      <Nav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        {/* Balance card */}
        <div
          style={{
            background: t.surface,
            border: `0.5px solid ${t.border}`,
            borderRadius: 12,
            padding: "16px",
            marginBottom: 24,
          }}
        >
          <p
            style={{ fontSize: 10, color: t.label, letterSpacing: "0.12em" }}
            className="font-medium uppercase mb-1"
          >
            Balance
          </p>
          <p style={{ fontSize: 26, fontWeight: 500, marginBottom: 14 }}>
            ฿ {MOCK_BALANCE.toLocaleString()}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              style={{
                flex: 1,
                background: t.primary,
                color: t.primaryText,
                border: "none",
                borderRadius: 20,
                padding: "9px",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Top up
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                background: "none",
                color: t.muted,
                border: `0.5px solid ${t.border}`,
                borderRadius: 20,
                padding: "9px",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Transactions */}
        <p
          style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }}
          className="font-medium uppercase mb-2"
        >
          Transactions
        </p>
        <div
          style={{
            background: t.surface,
            border: `0.5px solid ${t.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {MOCK_TRANSACTIONS.map((txn, i) => (
            <div
              key={txn.id}
              style={{
                padding: "11px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom:
                  i < MOCK_TRANSACTIONS.length - 1
                    ? `0.5px solid ${t.borderSubtle}`
                    : undefined,
              }}
            >
              <div>
                <span style={{ fontSize: 13, color: t.text }}>{txn.description}</span>
                <span style={{ fontSize: 11, color: t.muted, marginLeft: 8 }}>
                  {formatDate(txn.date)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: txn.amount > 0 ? "#3d9e5f" : "#c0392b",
                }}
              >
                {txn.amount > 0 ? "+" : ""}฿{Math.abs(txn.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
