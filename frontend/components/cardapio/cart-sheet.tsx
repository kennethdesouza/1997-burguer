'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'

import { fmtBRL } from '@/lib/utils'

const API = '/api'

const METODOS = [
  { id: 'PIX', label: 'PIX' },
  { id: 'DINHEIRO', label: 'Dinheiro' },
  { id: 'CARTAO_CREDITO', label: 'Crédito' },
  { id: 'CARTAO_DEBITO', label: 'Débito' },
]

export interface CartItem {
  produtoId: string
  nome: string
  preco: number
  quantidade: number
}

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  setCart: (cart: CartItem[]) => void
}

export function CartSheet({ open, onOpenChange, cart, setCart }: CartSheetProps) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [observacao, setObservacao] = useState('')
  const [metodo, setMetodo] = useState('PIX')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [numeroPedido, setNumeroPedido] = useState<number | null>(null)

  const total = cart.reduce((s, i) => s + i.preco * i.quantidade, 0)

  const updateQtd = (produtoId: string, delta: number) => {
    setCart(
      cart
        .map(i => i.produtoId === produtoId ? { ...i, quantidade: i.quantidade + delta } : i)
        .filter(i => i.quantidade > 0)
    )
  }

  const confirmar = async () => {
    if (!nome.trim()) { toast.error('Informe seu nome'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: { nome: nome.trim(), telefone: telefone.trim() || undefined },
          itens: cart.map(i => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
          observacao: observacao.trim() || undefined,
          pagamento: { metodo },
        }),
      })
      const pedido = await res.json()
      setNumeroPedido(pedido.numero)
      setSucesso(true)
      setCart([])
    } catch {
      toast.error('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fechar = () => {
    onOpenChange(false)
    if (sucesso) {
      setTimeout(() => {
        setSucesso(false)
        setNumeroPedido(null)
        setNome('')
        setTelefone('')
        setObservacao('')
        setMetodo('PIX')
      }, 300)
    }
  }

  return (
    <Sheet open={open} onOpenChange={fechar}>
      <SheetContent className="bg-zinc-950 border-zinc-800 text-white flex flex-col w-full sm:w-[400px] sm:max-w-[400px] p-0">
        <SheetHeader className="p-4 border-b border-zinc-800">
          <SheetTitle className="text-white text-base font-semibold">
            {sucesso ? 'Pedido realizado!' : 'Seu pedido'}
          </SheetTitle>
        </SheetHeader>

        {sucesso ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <CheckCircle className="h-16 w-16 text-green-400" />
            <div>
              <p className="text-xl font-bold">
                Pedido #{String(numeroPedido).padStart(3, '0')}
              </p>
              <p className="text-zinc-400 mt-2 text-sm">
                Recebemos seu pedido! Em breve estará pronto.
              </p>
            </div>
            <Button
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white w-full"
              onClick={fechar}
            >
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {/* Itens */}
              {cart.map(item => (
                <div key={item.produtoId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    <p className="text-orange-400 text-xs">{fmtBRL(item.preco)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full bg-zinc-800 hover:bg-zinc-700"
                      onClick={() => updateQtd(item.produtoId, -1)}
                    >
                      {item.quantidade === 1
                        ? <Trash2 className="h-3 w-3 text-red-400" />
                        : <Minus className="h-3 w-3" />
                      }
                    </Button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantidade}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full bg-zinc-800 hover:bg-zinc-700"
                      onClick={() => updateQtd(item.produtoId, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-semibold w-16 text-right flex-shrink-0">
                    {fmtBRL(item.preco * item.quantidade)}
                  </p>
                </div>
              ))}

              {/* Formulário */}
              <div className="border-t border-zinc-800 pt-4 mt-2 space-y-3">
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Nome *</Label>
                  <Input
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Telefone (opcional)</Label>
                  <Input
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(xx) xxxxx-xxxx"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-400 text-xs">Observação (opcional)</Label>
                  <Input
                    value={observacao}
                    onChange={e => setObservacao(e.target.value)}
                    placeholder="Ex: sem cebola"
                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 h-9 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Pagamento</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {METODOS.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodo(m.id)}
                        className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                          metodo === m.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="px-4 py-4 border-t border-zinc-800 gap-3">
              <div className="flex items-center justify-between w-full">
                <span className="text-zinc-400 text-sm">Total</span>
                <span className="text-xl font-bold text-orange-400">{fmtBRL(total)}</span>
              </div>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                disabled={cart.length === 0 || loading}
                onClick={confirmar}
              >
                {loading ? 'Enviando...' : 'Confirmar Pedido'}
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
