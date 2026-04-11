import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ede9e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="28" height="26" viewBox="0 0 40 36">
          {/* client bubble (top-left) */}
          <rect x="1" y="1" width="22" height="14" rx="4" fill="#3a3530" />
          <polygon points="4,15 11,15 4,21" fill="#3a3530" />
          {/* insider bubble (bottom-right) */}
          <rect x="17" y="19" width="22" height="14" rx="4" fill="#7a706a" />
          <polygon points="36,33 29,33 36,39" fill="#7a706a" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
