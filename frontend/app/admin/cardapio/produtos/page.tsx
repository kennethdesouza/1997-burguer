'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProdutosList } from '@/components/admin/produtos-list'
import { ProdutoDialog } from '@/components/admin/produto-dialog'
import { CardapioSubNav } from '@/components/admin/cardapio-subnav'

export default function ProdutosPage() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Itens disponíveis no cardápio</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Produto
        </Button>
      </div>

      <CardapioSubNav />

      <ProdutosList onNovo={() => setOpen(true)} />
      <ProdutoDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
