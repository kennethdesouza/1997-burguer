'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X, UtensilsCrossed, ChevronDown, Check } from 'lucide-react'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const maxW = 600
        const ratio = Math.min(maxW / img.width, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function ProdutoDialog({ open, onOpenChange, produto, onSalvo }: Props) {
  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '', imagem: '', categoriaId: '', disponivel: true,
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [salvando, setSalvando] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!catOpen) return
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [catOpen])

  useEffect(() => {
    fetch(`${'/api'}/categorias`)
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

  const set = (field: string, value: string | boolean | null) =>
    setForm(prev => ({ ...prev, [field]: value ?? '' }))

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await compressImage(file)
    set('imagem', base64)
    e.target.value = ''
  }

  const salvar = async () => {
    if (!form.nome.trim() || !form.preco || !form.categoriaId) return
    setSalvando(true)
    const url = produto?.id
      ? `${'/api'}/produtos/${produto.id}`
      : `${'/api'}/produtos`
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-zinc-950 border-zinc-800 text-white flex flex-col p-0 w-full sm:max-w-sm">
        <SheetHeader className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="h-4 w-4 text-orange-400" />
            </div>
            <SheetTitle className="text-white text-base font-semibold">
              {produto?.id ? 'Editar Produto' : 'Novo Produto'}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {/* Foto */}
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">Foto do produto</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFoto}
            />
            {form.imagem ? (
              <div className="relative rounded-xl overflow-hidden bg-zinc-800 aspect-video">
                <img src={form.imagem} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('imagem', '')}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  Trocar foto
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-zinc-700 hover:border-orange-500/50 bg-zinc-900 flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <ImagePlus className="h-7 w-7 text-zinc-600 group-hover:text-orange-500 transition-colors" />
                <span className="text-xs text-zinc-500 group-hover:text-zinc-300">
                  Toque para adicionar foto
                </span>
                <span className="text-xs text-zinc-700">câmera ou galeria</span>
              </button>
            )}
          </div>

          {/* Nome */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Nome *</Label>
            <Input
              value={form.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Smash Clássico"
              className="bg-zinc-900 border-zinc-700 text-white h-10"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5" ref={catRef}>
            <Label className="text-zinc-400 text-xs">Categoria *</Label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCatOpen(v => !v)}
                className="w-full flex items-center justify-between bg-zinc-900 border border-zinc-700 rounded-lg h-10 px-3 text-sm text-left transition-colors hover:border-zinc-600 focus:outline-none focus:border-orange-500"
              >
                <span className={form.categoriaId ? 'text-white' : 'text-zinc-500'}>
                  {categorias.find(c => c.id === form.categoriaId)?.nome ?? 'Selecionar categoria'}
                </span>
                <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg z-20 overflow-hidden shadow-lg">
                  {categorias.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { set('categoriaId', c.id); setCatOpen(false) }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-zinc-800 transition-colors"
                    >
                      <span className="text-white">{c.nome}</span>
                      {form.categoriaId === c.id && <Check className="h-4 w-4 text-orange-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={e => set('descricao', e.target.value)}
              placeholder="Ingredientes, diferenciais..."
              rows={2}
              className="bg-zinc-900 border-zinc-700 text-white resize-none"
            />
          </div>

          {/* Preço */}
          <div className="space-y-1.5">
            <Label className="text-zinc-400 text-xs">Preço (R$) *</Label>
            <Input
              value={form.preco}
              onChange={e => set('preco', e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="bg-zinc-900 border-zinc-700 text-white h-10"
            />
          </div>

          {/* Disponível */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Disponível no cardápio</p>
              <p className="text-xs text-zinc-500">Visível para os clientes</p>
            </div>
            <Switch
              checked={form.disponivel}
              onCheckedChange={v => set('disponivel', v)}
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
            disabled={salvando || !canSave}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
