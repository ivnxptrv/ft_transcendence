"use client";

import { useEffect, useState } from "react";

import { formatDate } from "@/lib/utils";

// Renders a timestamp in the viewer's timezone. formatDate runs in whatever
// runtime formats it: on the server (SSR) that's the container's TZ, in the
// browser it's the visitor's. We seed with the SSR value (so there's no layout
// shift) and re-format after mount so the final text is the viewer's local time.
// suppressHydrationWarning silences the expected server/client text mismatch.
export function LocalDateTime({
  iso,
  withTime = false,
  className,
}: {
  iso: string;
  withTime?: boolean;
  className?: string;
}) {
  const [text, setText] = useState(() => formatDate(new Date(iso), withTime));
  useEffect(() => {
    setText(formatDate(new Date(iso), withTime));
  }, [iso, withTime]);
  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
