'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/', label: 'Palpites' },
  { href: '/painel', label: 'Painel' },
  { href: '/placar', label: 'Placar' },
  { href: '/classificacao', label: 'Classificação' },
  { href: '/eliminatorias', label: 'Eliminatórias' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-[#121214] text-white">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-base tracking-tight text-white">⚽ Bolão Copa 2026</span>

        {/* Desktop links */}
        <div className="hidden md:flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-1 transition-colors rounded ${
                pathname === l.href ? 'text-nlw-yellow' : 'text-nlw-textMuted hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-nlw-textMuted hover:text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-nlw-input border-t border-nlw-card">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block px-5 py-3 text-sm font-medium transition-colors border-b border-nlw-card/50 ${
                pathname === l.href ? 'text-nlw-yellow' : 'text-nlw-textMuted hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
