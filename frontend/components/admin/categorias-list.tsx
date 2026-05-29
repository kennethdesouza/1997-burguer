'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { CategoriaDialog } from './categoria-dialog'

interface Categoria {
  id: string
  nome: string
  ordem: number
  ativa: boolean
  _count?: { produtos: number }
}

export function CategoriasList({ onNova }: { onNova: () => void }) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<Categoria | null>(null)

  const fetchCategorias = async () => {
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch {
      setCategorias([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategorias() }, [])

  const toggleAtiva = async (id: string, ativa: boolean) => {
    await fetch(`/api/categorias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativa }),
    })
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, ativa } : c))
  }

  const deletar = async (id: string) => {
    if (!confirm('Deletar categoria?')) return
    await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
    fetchCategorias()
  }

  if (loading) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full bg-zinc-800 rounded-xl" />)}
    </div>
  )

  if (categorias.length === 0) return (
    <Card className="bg-zinc-900 border-zinc-800 p-12 text-center">
      <p className="text-zinc-500 mb-4">Nenhuma categoria cadastrada ainda.</p>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onNova}>
        Criar primeira categoria
      </Button>
    </Card>
  )

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800 divide-y divide-zinc-800">
        {categorias.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
            {/* Ícone */}
            <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Tag className="h-3.5 w-3.5 text-orange-400" />
            </div>

            {/* Nome + contagem */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{cat.nome}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {cat._count?.produtos ?? 0} produto{(cat._count?.produtos ?? 0) !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Toggle ativa */}
            <Switch
              checked={cat.ativa}
              onCheckedChange={v => toggleAtiva(cat.id, v)}
              className="data-[state=checked]:bg-green-500"
            />

            {/* Ações */}
            <div className="flex gap-1">
              <Button
                size="icon" variant="ghost"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setEditando(cat)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon" variant="ghost"
                className="h-8 w-8 text-zinc-400 hover:text-red-400"
                onClick={() => deletar(cat.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </Card>

      <CategoriaDialog
        open={!!editando}
        onOpenChange={open => !open && setEditando(null)}
        categoria={editando ?? undefined}
        onSalvo={fetchCategorias}
      />
    </>
  )
}
