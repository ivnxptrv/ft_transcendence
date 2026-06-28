// Root 404 for non-localized requests (paths that don't match any locale).
// The localized 404 lives at [locale]/not-found.tsx. This one must render its
// own <html>/<body> since it's outside the [locale] layout.
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
            fontFamily: "system-ui, sans-serif",
            background: "#000",
            color: "#fff",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>404</h1>
            <p style={{ color: "#888" }}>Page not found</p>
          </div>
        </div>
      </body>
    </html>
  );
}
