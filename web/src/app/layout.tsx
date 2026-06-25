// Since we have a root `not-found.tsx` page, a layout file is required on
// Next.js 16, even if it's just passing children through. The real html/body
// and locale provider live in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
