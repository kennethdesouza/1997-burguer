'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin/cardapio/produtos', label: 'Produtos' },
  { href: '/admin/cardapio/categorias', label: 'Categorias' },
]

export function CardapioSubNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden flex gap-1 mb-5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
      {items.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors',
            pathname === item.href
              ? 'bg-orange-500 text-white'
              : 'text-zinc-400 hover:text-white'
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
