'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface Categoria { id: string; nome: string }
interface Produto {
  id?: string
  nome: string
  descricao?: string
  preco: number
  imagem?: string
  disponivel?: boolean
  categoria?: Categoria
  categoriaId?: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  produto?: Produto
  onSalvo?: () => void
}

export function ProdutoDialog({ open, onOpenChange, produto, onSalvo }: Props) {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', imagem: '', categoriaId: '', disponivel: true })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categorias`)
      .then(r => r.json()).then(setCategorias).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      setForm({
        nome: produto?.nome ?? '',
        descricao: produto?.descricao ?? '',
        preco: produto?.preco ? String(produto.preco) : '',
        imagem: produto?.imagem ?? '',
        categoriaId: produto?.categoriaId ?? produto?.categoria?.id ?? '',
        disponivel: produto?.disponivel ?? true,
      })
    }
  }, [open, produto])

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const salvar = async () => {
    if (!form.nome.trim() || !form.preco || !form.categoriaId) return
    setSalvando(true)
    const url = produto?.id
      ? `${process.env.NEXT_PUBLIC_API_URL}/produtos/${produto.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/produtos`
    await fetch(url, {
      method: produto?.id ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        descricao: form.descricao || undefined,
        preco: parseFloat(form.preco.replace(',', '.')),
        imagem: form.imagem || undefined,
        categoriaId: form.categoriaId,
        disponivel: form.disponivel,
      }),
    })
    setSalvando(false)
    onOpenChange(false)
    onSalvo?.()
  }

  const canSave = form.nome.trim() && form.preco && form.categoriaId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>{produto?.id ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Smash Clássico" className="bg-zinc-800 border-zinc-700 text-white" />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              placeholder="Ingredientes, diferenciais..." rows={2}
              className="bg-zinc-800 border-zinc-700 text-white resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Preço (R$) *</Label>
              <Input value={form.preco} onChange={e => set('preco', e.target.value)}
                placeholder="0,00" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label>Categoria *</Label>
              <Select value={form.categoriaId} onValueChange={v => set('categoriaId', v)}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {categorias.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-white">{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL da foto</Label>
            <Input value={form.imagem} onChange={e => set('imagem', e.target.value)}
              placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-white" />
          </div>

          <div className="flex items-center justify-between">
            <Label>Disponível no cardápio</Label>
            <Switch checked={form.disponivel} onCheckedChange={v => set('disponivel', v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400">
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={salvando || !canSave}
            className="bg-orange-500 hover:bg-orange-600 text-white">
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
