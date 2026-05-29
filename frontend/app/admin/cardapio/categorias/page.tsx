'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoriasList } from '@/components/admin/categorias-list'
import { CategoriaDialog } from '@/components/admin/categoria-dialog'
import { CardapioSubNav } from '@/components/admin/cardapio-subnav'

export default function CategoriasPage() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Grupos que organizam o cardápio</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-1.5">Nova Categoria</span>
        </Button>
      </div>

      <CardapioSubNav />

      <CategoriasList onNova={() => setOpen(true)} />
      <CategoriaDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
