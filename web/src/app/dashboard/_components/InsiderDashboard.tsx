import type { Match, MatchStatus, InsiderProfile } from "@/lib/types";
import Link from "next/link";
import InsiderNav from "./InsiderNav";

const STATUS_LABEL: Record<MatchStatus, string> = {
  new: "New",
  responded: "Sent",
  purchased: "Purchased",
  rated: "Rated",
};

const STATUS_STYLE: Record<MatchStatus, { background: string; color: string }> = {
  new: { background: "#fdf3e3", color: "#8a5e1a" },
  responded: { background: "#e8f0fb", color: "#1a4a8a" },
  purchased: { background: "#eaf6ee", color: "#1a6a35" },
  rated: { background: "#f0ede8", color: "#7a7068" },
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function CredibilityBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div
        style={{ height: 3, background: "#e8e5e0", borderRadius: 2, overflow: "hidden" }}
        className="flex-1"
      >
        <div
          style={{
            height: "100%",
            width: `${(score / 5) * 100}%`,
            background: "#c4882a",
            borderRadius: 2,
          }}
        />
      </div>
      <span style={{ fontSize: 14, color: "#2a2520" }} className="font-medium">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function InsiderDashboard({
  matches,
  profile,
}: {
  matches: Match[];
  profile: InsiderProfile;
}) {
  const newCount = matches.filter((m) => m.status === "new").length;

  return (
    <div style={{ background: "#faf9f7", minHeight: "100vh", color: "#2a2520" }}>
      <InsiderNav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: "#b0a898", letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-0.5"
        >
          Insider
        </p>
        <h1 style={{ fontSize: 20, color: "#2a2520" }} className="font-medium mb-4">
          Karn Srisuk
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div
            style={{ background: "#fff", border: "0.5px solid #e8e5e0", borderRadius: 10 }}
            className="p-3"
          >
            <p style={{ fontSize: 11, color: "#b0a898" }} className="mb-1">
              Credibility
            </p>
            <CredibilityBar score={profile.credibilityScore} />
          </div>
          <div
            style={{ background: "#fff", border: "0.5px solid #e8e5e0", borderRadius: 10 }}
            className="p-3"
          >
            <p style={{ fontSize: 11, color: "#b0a898" }} className="mb-1">
              Earnings
            </p>
            <p style={{ fontSize: 14, color: "#2a2520" }} className="font-medium">
              ฿{profile.totalEarnings.toLocaleString()}
            </p>
          </div>
          <div
            style={{ background: "#fff", border: "0.5px solid #e8e5e0", borderRadius: 10 }}
            className="p-3"
          >
            <p style={{ fontSize: 11, color: "#b0a898" }} className="mb-1">
              Responses
            </p>
            <p style={{ fontSize: 14, color: "#2a2520" }} className="font-medium">
              {profile.totalResponses}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-2.5">
          <span style={{ fontSize: 12, color: "#b0a898" }}>Matched requests</span>
          {newCount > 0 && (
            <span
              style={{ fontSize: 10, background: "#fdf3e3", color: "#8a5e1a", borderRadius: 20 }}
              className="font-medium px-2 py-0.5"
            >
              {newCount} new
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {matches.map((match) => (
            <Link
              key={match.id}
              href={`/matches/${match.id}`}
              style={{ background: "#fff", border: "0.5px solid #e8e5e0", borderRadius: 12 }}
              className="block p-3.5 hover:border-[#d0cdc8] transition-colors"
            >
              <div className="flex items-start gap-2.5 mb-2.5">
                <p
                  style={{ fontSize: 13, color: "#3a3530", lineHeight: 1.5 }}
                  className="flex-1 line-clamp-2"
                >
                  {match.clientQuery}
                </p>
                <span
                  style={{ fontSize: 10, borderRadius: 20, ...STATUS_STYLE[match.status] }}
                  className="font-medium px-2 py-0.5 whitespace-nowrap shrink-0"
                >
                  {STATUS_LABEL[match.status]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 11, color: "#9a9088" }}>
                  {Math.round(match.matchScore * 100)}% match
                </span>
                {match.yourPrice && (
                  <span style={{ fontSize: 11, color: "#9a9088" }}>฿{match.yourPrice}</span>
                )}
                <span style={{ fontSize: 11, color: "#c8c0b4" }}>
                  {formatDate(match.receivedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
