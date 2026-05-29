'use client'

import { useEffect, useState } from 'react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Categoria {
  id?: string
  nome: string
  ordem?: number
  ativa?: boolean
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: Categoria
  onSalvo?: () => void
}

export function CategoriaDialog({ open, onOpenChange, categoria, onSalvo }: Props) {
  const [nome, setNome] = useState('')
  const [ativa, setAtiva] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (open) {
      setNome(categoria?.nome ?? '')
      setAtiva(categoria?.ativa ?? true)
    }
  }, [open, categoria])

  const salvar = async () => {
    if (!nome.trim()) return
    setSalvando(true)
    const url = categoria?.id
      ? `${process.env.NEXT_PUBLIC_API_URL}/categorias/${categoria.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/categorias`
    await fetch(url, {
      method: categoria?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, ativa }),
    })
    setSalvando(false)
    onOpenChange(false)
    onSalvo?.()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950 border-zinc-800 text-white flex flex-col p-0 w-full sm:max-w-sm">
        <SheetHeader className="p-5 border-b border-zinc-800">
          <SheetTitle className="text-white text-base font-semibold">
            {categoria?.id ? 'Editar Categoria' : 'Nova Categoria'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-5 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Nome</Label>
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Burgers, Bebidas, Sobremesas..."
              className="bg-zinc-900 border-zinc-700 text-white h-10"
              onKeyDown={e => e.key === 'Enter' && salvar()}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Ativa no cardápio</p>
              <p className="text-xs text-zinc-500">Visível para os clientes</p>
            </div>
            <Switch
              checked={ativa}
              onCheckedChange={setAtiva}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>

        <SheetFooter className="px-5 py-4 border-t border-zinc-800 gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-zinc-400 hover:text-white border border-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={salvar}
            disabled={salvando || !nome.trim()}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
