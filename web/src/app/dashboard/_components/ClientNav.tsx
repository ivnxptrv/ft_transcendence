'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/dashboard', label: 'Requests' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/settings', label: 'Settings' },
]

export default function ClientNav() {
  const pathname = usePathname()

  return (
    <nav style={{ background: '#0f0f0f', borderBottom: '0.5px solid #1f1f1f' }} className="px-4 h-11 flex items-center justify-between">
      <span style={{ fontSize: 11, color: '#444', letterSpacing: '0.12em' }} className="font-medium uppercase">
        Insight
      </span>
      <div className="flex items-center gap-0.5">
        {LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 11,
              color: pathname === link.href ? '#e4e4e4' : '#555',
              background: pathname === link.href ? '#1e1e1e' : 'transparent',
            }}
            className="px-2.5 py-1 rounded-full"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
