import { ReactNode } from "react";

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
