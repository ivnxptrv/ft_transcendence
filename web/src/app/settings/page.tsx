import type { ReactNode } from "react";
import { MOCK_ROLE, getTheme } from "@/lib/mock-role";
import ClientNav from "@/app/dashboard/_components/ClientNav";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

function SettingsRow({
  label,
  right,
  danger,
  t,
}: {
  label: string;
  right?: ReactNode;
  danger?: boolean;
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div
      style={{
        padding: "11px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span style={{ fontSize: 13, color: danger ? t.danger : t.text }}>{label}</span>
      {right && <span style={{ fontSize: 12, color: t.muted }}>{right}</span>}
    </div>
  );
}

function SettingsGroup({
  rows,
  t,
}: {
  rows: ReactNode[];
  t: ReturnType<typeof getTheme>;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `0.5px solid ${t.border}`,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 24,
      }}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          style={
            i < rows.length - 1
              ? { borderBottom: `0.5px solid ${t.borderSubtle}` }
              : undefined
          }
        >
          {row}
        </div>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const t = getTheme(MOCK_ROLE);
  const Nav = MOCK_ROLE === "client" ? ClientNav : InsiderNav;

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text }}>
      <Nav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: t.label, letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-5"
        >
          Settings
        </p>

        <p style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }} className="uppercase font-medium mb-2">
          Account
        </p>
        <SettingsGroup
          t={t}
          rows={[
            <SettingsRow key="email" label="Change email" right="›" t={t} />,
            <SettingsRow key="password" label="Change password" right="›" t={t} />,
          ]}
        />

        <p style={{ fontSize: 10, color: t.subtle, letterSpacing: "0.1em" }} className="uppercase font-medium mb-2">
          Developer
        </p>
        <SettingsGroup
          t={t}
          rows={[
            <SettingsRow
              key="apikey"
              label="API key"
              right={
                <span>
                  <span style={{ fontFamily: "monospace" }}>sk-••••••••</span>
                  {"  "}
                  <span style={{ color: t.muted, fontSize: 11 }}>copy</span>
                </span>
              }
              t={t}
            />,
            <SettingsRow key="docs" label="Docs" right="↗" t={t} />,
          ]}
        />

        <SettingsGroup
          t={t}
          rows={[<SettingsRow key="signout" label="Sign out" danger t={t} />]}
        />
      </div>
    </div>
  );
}
