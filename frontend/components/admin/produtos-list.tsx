'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, ImageOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ProdutoDialog } from './produto-dialog'

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  imagem?: string
  disponivel: boolean
  categoria: { id: string; nome: string }
}

export function ProdutosList({ onNovo }: { onNovo: () => void }) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Produto | null>(null)

  const fetchProdutos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos`)
      const data = await res.json()
      setProdutos(data)
    } catch {
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProdutos() }, [])

  const toggleDisponivel = async (id: string, disponivel: boolean) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disponivel }),
    })
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, disponivel } : p))
  }

  const deletar = async (id: string) => {
    if (!confirm('Deletar produto?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/produtos/${id}`, { method: 'DELETE' })
    fetchProdutos()
  }

  const fmtPreco = (v: number) =>
    `R$ ${Number(v).toFixed(2).replace('.', ',')}`

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full bg-zinc-800" />)}
    </div>
  )

  if (produtos.length === 0) return (
    <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
      <p className="text-zinc-500 mb-4">Nenhum produto cadastrado ainda.</p>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onNovo}>
        Adicionar primeiro produto
      </Button>
    </Card>
  )

  return (
    <>
      <div className="space-y-2">
        {produtos.map((produto) => (
          <Card key={produto.id} className="bg-zinc-900 border-zinc-800 px-4 py-3 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {produto.imagem
                ? <img src={produto.imagem} alt={produto.nome} className="h-full w-full object-cover" />
                : <ImageOff className="h-5 w-5 text-zinc-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{produto.nome}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-orange-400 font-semibold text-sm">{fmtPreco(produto.preco)}</span>
                <span className="text-zinc-600 text-xs">•</span>
                <span className="text-zinc-500 text-xs">{produto.categoria?.nome}</span>
              </div>
            </div>
            <Switch
              checked={produto.disponivel}
              onCheckedChange={(v) => toggleDisponivel(produto.id, v)}
              className="data-[state=checked]:bg-green-500"
            />
            <Badge variant="outline"
              className={produto.disponivel
                ? 'border-green-500/30 text-green-400 text-xs'
                : 'border-zinc-700 text-zinc-500 text-xs'}>
              {produto.disponivel ? 'Disponível' : 'Indisponível'}
            </Badge>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setEditando(produto)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400"
                onClick={() => deletar(produto.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ProdutoDialog
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        produto={editando ?? undefined}
        onSalvo={fetchProdutos}
      />
    </>
  )
}
