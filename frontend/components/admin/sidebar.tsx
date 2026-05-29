'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/cardapio', label: 'Cardápio', icon: UtensilsCrossed },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/configuracoes', label: 'Config', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop: sidebar lateral ── */}
      <aside className="hidden md:flex w-60 flex-col bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        <div className="px-6 py-5 border-b border-zinc-800">
          <span className="text-lg font-bold text-orange-500">1997 Burger</span>
          <p className="text-xs text-zinc-500 mt-0.5">Painel Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">Cerro Azul — PR</p>
        </div>
      </aside>

      {/* ── Mobile: bottom navigation ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-zinc-900 border-t border-zinc-800 flex safe-area-inset-bottom">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
              pathname === href
                ? 'text-orange-400'
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            <Icon className={cn('h-5 w-5', pathname === href && 'stroke-[2.2]')} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
