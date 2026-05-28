'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>{categoria?.id ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Burgers, Bebidas, Sobremesas..."
              className="bg-zinc-800 border-zinc-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && salvar()}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Ativa no cardápio</Label>
            <Switch checked={ativa} onCheckedChange={setAtiva} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !nome.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white">
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
