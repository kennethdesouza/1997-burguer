'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CategoriasList } from '@/components/admin/categorias-list'
import { ProdutosList } from '@/components/admin/produtos-list'
import { CategoriaDialog } from '@/components/admin/categoria-dialog'
import { ProdutoDialog } from '@/components/admin/produto-dialog'

export default function CardapioPage() {
  const [tab, setTab] = useState('produtos')
  const [produtoOpen, setProdutoOpen] = useState(false)
  const [categoriaOpen, setCategoriaOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cardápio</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Gerencie produtos e categorias</p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => tab === 'produtos' ? setProdutoOpen(true) : setCategoriaOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {tab === 'produtos' ? 'Novo Produto' : 'Nova Categoria'}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
          <TabsTrigger value="produtos" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Produtos
          </TabsTrigger>
          <TabsTrigger value="categorias" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <ProdutosList onNovo={() => setProdutoOpen(true)} />
        </TabsContent>

        <TabsContent value="categorias">
          <CategoriasList onNova={() => setCategoriaOpen(true)} />
        </TabsContent>
      </Tabs>

      <ProdutoDialog open={produtoOpen} onOpenChange={setProdutoOpen} />
      <CategoriaDialog open={categoriaOpen} onOpenChange={setCategoriaOpen} />
    </div>
  )
}
