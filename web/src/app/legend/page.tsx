"use client";

import { useState } from "react";
import { MOCK_INSIDER_PROFILE } from "@/lib/mock-data";
import InsiderNav from "@/app/dashboard/_components/InsiderNav";

const existingLegend = MOCK_INSIDER_PROFILE[0]?.legend ?? "";

export default function LegendPage() {
  const [legend, setLegend] = useState(existingLegend);

  return (
    <div style={{ background: "#faf9f7", minHeight: "100vh", color: "#2a2520" }}>
      <InsiderNav />
      <div className="px-4 pt-6 pb-8 max-w-2xl mx-auto">
        <p
          style={{ fontSize: 10, color: "#b0a898", letterSpacing: "0.12em" }}
          className="font-medium uppercase mb-1"
        >
          Your legend
        </p>
        <p style={{ fontSize: 12, color: "#9a9088", lineHeight: 1.5 }} className="mb-5">
          This is what clients see before buying. Write from experience — who you are and what you
          know.
        </p>
        <textarea
          value={legend}
          onChange={(e) => setLegend(e.target.value)}
          placeholder='e.g. "Freelance developer, 4 years in Bangkok after leaving corporate…"'
          style={{
            width: "100%",
            background: "#fff",
            border: "0.5px solid #e8e5e0",
            borderRadius: 10,
            padding: "12px",
            fontSize: 13,
            color: "#3a3530",
            lineHeight: 1.65,
            resize: "none",
            height: 180,
            boxSizing: "border-box",
            fontFamily: "inherit",
            outline: "none",
          }}
          className="mb-4"
        />
        <button
          type="button"
          style={{
            width: "100%",
            background: "#2a2520",
            color: "#faf9f7",
            border: "none",
            borderRadius: 20,
            padding: "11px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Save legend
        </button>
      </div>
    </div>
  );
}
