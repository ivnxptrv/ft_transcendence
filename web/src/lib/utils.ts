export function formatDate(date: Date, withTime = false) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamelCase(value),
      ])
    );
  }

  return obj;
}
