'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, UtensilsCrossed, ClipboardList,
  Settings, ChevronDown, Tag, Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const cardapioItems = [
  { href: '/admin/cardapio/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/cardapio/categorias', label: 'Categorias', icon: Tag },
]

const bottomLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/cardapio', label: 'Cardápio', icon: UtensilsCrossed, exact: false },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList, exact: true },
  { href: '/admin/configuracoes', label: 'Config', icon: Settings, exact: true },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const cardapioAtivo = pathname.startsWith('/admin/cardapio')

  // Abre automaticamente se já estiver numa rota de cardápio
  const [cardapioOpen, setCardapioOpen] = useState(cardapioAtivo)

  useEffect(() => {
    if (cardapioAtivo) setCardapioOpen(true)
  }, [cardapioAtivo])

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* ── Desktop: sidebar lateral ── */}
      <aside className="hidden md:flex w-56 flex-col bg-zinc-900 border-r border-zinc-800 flex-shrink-0">
        <div className="px-5 py-5 border-b border-zinc-800">
          <span className="text-lg font-bold text-orange-500">1997 Burger</span>
          <p className="text-xs text-zinc-500 mt-0.5">Painel Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/admin'
                ? 'bg-orange-500/10 text-orange-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Cardápio — botão que expande, não navega */}
          <div>
            <button
              type="button"
              onClick={() => setCardapioOpen(prev => !prev)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left',
                cardapioAtivo
                  ? 'bg-orange-500/10 text-orange-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              )}
            >
              <UtensilsCrossed className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">Cardápio</span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-200',
                  cardapioOpen ? 'rotate-180' : ''
                )}
              />
            </button>

            {cardapioOpen && (
              <div className="ml-3 mt-0.5 pl-4 border-l border-zinc-800 space-y-0.5">
                {cardapioItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                      pathname === href
                        ? 'text-orange-400 font-medium bg-orange-500/5'
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pedidos */}
          <Link
            href="/admin/pedidos"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/admin/pedidos'
                ? 'bg-orange-500/10 text-orange-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <ClipboardList className="h-4 w-4" />
            Pedidos
          </Link>

          {/* Configurações */}
          <Link
            href="/admin/configuracoes"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === '/admin/configuracoes'
                ? 'bg-orange-500/10 text-orange-400'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </nav>

        <div className="px-5 py-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">Cerro Azul — PR</p>
        </div>
      </aside>

      {/* ── Mobile: bottom navigation ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-zinc-900 border-t border-zinc-800 flex">
        {bottomLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          const dest = href === '/admin/cardapio' ? '/admin/cardapio/produtos' : href
          return (
            <Link
              key={href}
              href={dest}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors',
                active ? 'text-orange-400' : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'stroke-[2.2]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
