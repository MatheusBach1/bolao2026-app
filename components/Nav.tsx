'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Palpites' },
  { href: '/painel', label: 'Painel' },
  { href: '/placar', label: 'Placar' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-brand-dark text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-lg tracking-tight">⚽ Bolão Copa 2026</span>
        <div className="flex gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                pathname === l.href
                  ? 'bg-brand-green text-white'
                  : 'hover:bg-white/10'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
