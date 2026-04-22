import type { ReactNode } from "react";

export function SettingsRow({
  label,
  right,
  danger,
  isClient,
  onClick,
}: {
  label: string;
  right?: ReactNode;
  danger?: boolean;
  isClient: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-5 flex items-center justify-between transition-colors cursor-pointer group ${isClient ? "hover:bg-white/2" : "hover:bg-zinc-50"}`}
    >
      <span
        className={`text-[13px] font-semibold ${danger ? "text-red-500" : isClient ? "text-zinc-200" : "text-zinc-900"}`}
      >
        {label}
      </span>
      {right && (
        <span
          className={`text-xs font-medium transition-colors ${isClient ? "text-zinc-600 group-hover:text-zinc-400" : "text-zinc-400 group-hover:text-zinc-600"}`}
        >
          {right}
        </span>
      )}
    </div>
  );
}

export function SettingsGroup({ rows, isClient }: { rows: ReactNode[]; isClient: boolean }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden mb-8 ${isClient ? "bg-zinc-900/40 border-white/5" : "bg-white border-zinc-200/60 shadow-sm"}`}
    >
      {rows.map((row, i) => (
        <div
          key={i}
          className={
            i < rows.length - 1
              ? isClient
                ? "border-b border-white/5"
                : "border-b border-zinc-100"
              : ""
          }
        >
          {row}
        </div>
      ))}
    </div>
  );
}
