'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Minus, Plus, ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CartSheet, type CartItem } from '@/components/cardapio/cart-sheet'

interface Adicional {
  id: string
  nome: string
  preco: number
}

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  imagem?: string
  adicionais: Adicional[]
}

interface Categoria {
  id: string
  nome: string
  produtos: Produto[]
}

const API = process.env.NEXT_PUBLIC_API_URL
const fmtBRL = (v: number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`

export default function CardapioPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaAtiva, setCategoriaAtiva] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    fetch(`${API}/cardapio`)
      .then(r => r.json())
      .then(data => {
        setCategorias(data)
        if (data.length > 0) setCategoriaAtiva(data[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (produto: Produto) => {
    setCart(prev => {
      const exists = prev.find(i => i.produtoId === produto.id)
      if (exists) {
        return prev.map(i =>
          i.produtoId === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i
        )
      }
      return [...prev, {
        produtoId: produto.id,
        nome: produto.nome,
        preco: Number(produto.preco),
        quantidade: 1,
      }]
    })
  }

  const removeFromCart = (produtoId: string) => {
    setCart(prev =>
      prev
        .map(i => i.produtoId === produtoId ? { ...i, quantidade: i.quantidade - 1 } : i)
        .filter(i => i.quantidade > 0)
    )
  }

  const totalItems = cart.reduce((s, i) => s + i.quantidade, 0)
  const totalValor = cart.reduce((s, i) => s + i.preco * i.quantidade, 0)
  const categoriaAtual = categorias.find(c => c.id === categoriaAtiva)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-lg font-bold text-orange-500">1997 Burger</span>
          <p className="text-xs text-zinc-500 mt-0.5">Cerro Azul — PR</p>
        </div>
        <Button
          variant="ghost"
          className="relative text-zinc-300 hover:text-white hover:bg-zinc-800"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
              {totalItems}
            </span>
          )}
        </Button>
      </header>

      {/* Abas de categorias */}
      {!loading && categorias.length > 0 && (
        <div className="sticky top-[57px] z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
          <div className="flex gap-1 px-4 py-3 overflow-x-auto">
            {categorias.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoriaAtiva(cat.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  categoriaAtiva === cat.id
                    ? 'bg-orange-500 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Produtos */}
      <main className="px-4 py-5 max-w-2xl mx-auto pb-32">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-24 w-full bg-zinc-800 rounded-xl" />
            ))}
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p>Cardápio indisponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categoriaAtual?.produtos.map(produto => {
              const qtd = cart.find(i => i.produtoId === produto.id)?.quantidade ?? 0
              return (
                <div
                  key={produto.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3 p-3"
                >
                  <div className="h-16 w-16 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {produto.imagem
                      ? <img src={produto.imagem} alt={produto.nome} className="h-full w-full object-cover" />
                      : <ImageOff className="h-5 w-5 text-zinc-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{produto.nome}</p>
                    {produto.descricao && (
                      <p className="text-zinc-500 text-xs line-clamp-2 mt-0.5">{produto.descricao}</p>
                    )}
                    <p className="text-orange-400 font-bold text-sm mt-1">
                      {fmtBRL(Number(produto.preco))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {qtd > 0 && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white"
                          onClick={() => removeFromCart(produto.id)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="text-sm font-bold w-4 text-center">{qtd}</span>
                      </>
                    )}
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => addToCart(produto)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Botão flutuante do carrinho */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 inset-x-4 flex justify-center z-40">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-3 h-12 shadow-lg shadow-orange-500/20 font-semibold text-sm gap-2 w-full max-w-sm"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Ver pedido</span>
            <span className="mx-1 text-orange-200">•</span>
            <span>{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
            <span className="mx-1 text-orange-200">•</span>
            <span>{fmtBRL(totalValor)}</span>
          </Button>
        </div>
      )}

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        cart={cart}
        setCart={setCart}
      />
    </div>
  )
}
