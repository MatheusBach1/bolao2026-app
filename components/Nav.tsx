'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Palpites' },
  { href: '/painel', label: 'Painel' },
  { href: '/placar', label: 'Placar' },
  { href: '/classificacao', label: 'Classificação' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <nav className="bg-[#121214] text-white">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-lg tracking-tight text-white hidden sm:block">⚽ Bolão Copa 2026</span>
        <div className="flex gap-1 sm:gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-1 transition-colors ${
                pathname === l.href
                  ? 'text-nlw-yellow'
                  : 'text-nlw-textMuted hover:text-white'
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
