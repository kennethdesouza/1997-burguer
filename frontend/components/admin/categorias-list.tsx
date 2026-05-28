'use client'

import { useState, useEffect } from 'react'
import { Pencil, Trash2, GripVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`)
      const data = await res.json()
      setCategorias(data)
    } catch {
      setCategorias([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCategorias() }, [])

  const deletar = async (id: string) => {
    if (!confirm('Deletar categoria?')) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias/${id}`, { method: 'DELETE' })
    fetchCategorias()
  }

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full bg-zinc-800" />)}
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
      <div className="space-y-2">
        {categorias.map((cat) => (
          <Card key={cat.id} className="bg-zinc-900 border-zinc-800 px-4 py-3 flex items-center gap-4">
            <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
            <div className="flex-1">
              <span className="font-medium">{cat.nome}</span>
              <span className="text-zinc-500 text-sm ml-3">
                {cat._count?.produtos ?? 0} produto{(cat._count?.produtos ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <Badge variant={cat.ativa ? 'default' : 'secondary'}
              className={cat.ativa ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-800 text-zinc-500'}>
              {cat.ativa ? 'Ativa' : 'Inativa'}
            </Badge>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => setEditando(cat)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-red-400"
                onClick={() => deletar(cat.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <CategoriaDialog
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        categoria={editando ?? undefined}
        onSalvo={fetchCategorias}
      />
    </>
  )
}
