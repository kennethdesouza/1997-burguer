'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Clock, ChefHat, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ItemPedido {
  produto: { nome: string }
  quantidade: number
  observacao?: string
}

interface Pedido {
  id: string
  numero: number
  status: string
  total: number
  observacao?: string
  cliente?: { nome: string; telefone?: string }
  itens: ItemPedido[]
  pagamento?: { metodo: string }
  createdAt: string
}

const fmtBRL = (v: number) => `R$ ${Number(v).toFixed(2).replace('.', ',')}`

const METODO_LABEL: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Crédito',
  CARTAO_DEBITO: 'Débito',
}

const COLUNAS = [
  { status: 'PENDENTE',   label: 'Pendente',   badgeCls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', btnCls: 'bg-yellow-500 hover:bg-yellow-600 text-white', acao: 'Confirmar',     proximo: 'CONFIRMADO' },
  { status: 'CONFIRMADO', label: 'Confirmado', badgeCls: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       btnCls: 'bg-blue-500 hover:bg-blue-600 text-white',     acao: 'Preparar',      proximo: 'PREPARANDO' },
  { status: 'PREPARANDO', label: 'Preparando', badgeCls: 'text-purple-400 bg-purple-400/10 border-purple-400/20', btnCls: 'bg-purple-500 hover:bg-purple-600 text-white', acao: 'Marcar Pronto', proximo: 'PRONTO' },
  { status: 'PRONTO',     label: 'Pronto',     badgeCls: 'text-green-400 bg-green-400/10 border-green-400/20',   btnCls: 'bg-green-500 hover:bg-green-600 text-white',   acao: 'Entregar',      proximo: 'ENTREGUE' },
]

function playBeep() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

function tempoDecorrido(createdAt: string) {
  const min = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}min`
}

function PedidoCard({
  pedido, coluna, onAvancar,
}: {
  pedido: Pedido
  coluna: (typeof COLUNAS)[number]
  onAvancar: (id: string, status: string) => void
}) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 30_000)
    return () => clearInterval(t)
  }, [])

  return (
    <Card className="bg-zinc-900 border-zinc-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-sm">#{String(pedido.numero).padStart(3, '0')}</span>
        <span className="flex items-center gap-1 text-zinc-500 text-xs">
          <Clock className="h-3 w-3" />
          {tempoDecorrido(pedido.createdAt)}
        </span>
      </div>
      {pedido.cliente && (
        <p className="text-sm text-zinc-300 font-medium">{pedido.cliente.nome}</p>
      )}
      <div className="space-y-0.5">
        {pedido.itens.map((item, i) => (
          <p key={i} className="text-xs text-zinc-400">
            <span className="text-zinc-300">{item.quantidade}×</span> {item.produto.nome}
            {item.observacao && <span className="text-zinc-600"> ({item.observacao})</span>}
          </p>
        ))}
        {pedido.observacao && (
          <p className="text-xs text-zinc-600 italic mt-1">"{pedido.observacao}"</p>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-zinc-800 pt-2">
        <span className="text-xs text-zinc-500">
          {pedido.pagamento ? (METODO_LABEL[pedido.pagamento.metodo] ?? pedido.pagamento.metodo) : ''}
        </span>
        <span className="font-semibold text-orange-400 text-sm">{fmtBRL(pedido.total)}</span>
      </div>
      <Button
        size="sm"
        className={`w-full text-xs ${coluna.btnCls}`}
        onClick={() => onAvancar(pedido.id, coluna.proximo)}
      >
        {coluna.acao} →
      </Button>
    </Card>
  )
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const knownIds = useRef<Set<string>>(new Set())
  const isFirst = useRef(true)

  const carregar = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos')
      const data: Pedido[] = await res.json()

      if (!isFirst.current) {
        const novos = data.filter(
          p => !knownIds.current.has(p.id) && p.status === 'PENDENTE'
        )
        novos.forEach(p => {
          playBeep()
          toast(`Novo pedido #${String(p.numero).padStart(3, '0')}!`, {
            description: p.cliente?.nome ?? 'Pedido recebido',
          })
        })
      }

      data.forEach(p => knownIds.current.add(p.id))
      setPedidos(data)
      isFirst.current = false
    } catch {}
  }, [])

  useEffect(() => {
    carregar().finally(() => setLoading(false))
    const interval = setInterval(carregar, 3000)
    return () => clearInterval(interval)
  }, [carregar])

  const avancarStatus = useCallback(async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const updated = await res.json()
      setPedidos(prev => prev.map(p => p.id === id ? updated : p))
    } catch {
      toast.error('Erro ao atualizar status.')
    }
  }, [])

  const ativos = pedidos.filter(p => ['PENDENTE', 'CONFIRMADO', 'PREPARANDO', 'PRONTO'].includes(p.status))
  const entregues = pedidos.filter(p => p.status === 'ENTREGUE')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Atualiza a cada 3 segundos</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
          Ao vivo
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-shrink-0 w-[280px] lg:w-auto">
              <Skeleton className="h-48 bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {COLUNAS.map(col => {
              const itens = ativos.filter(p => p.status === col.status)
              return (
                <div key={col.status} className="flex-shrink-0 w-[280px] lg:w-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-zinc-300">{col.label}</span>
                    {itens.length > 0 && (
                      <Badge className={`text-xs border ${col.badgeCls}`}>{itens.length}</Badge>
                    )}
                  </div>
                  <div className="space-y-3 min-h-[100px]">
                    {itens.length === 0 ? (
                      <div className="h-20 border border-dashed border-zinc-800 rounded-xl flex items-center justify-center">
                        <span className="text-xs text-zinc-700">Vazio</span>
                      </div>
                    ) : (
                      itens.map(p => (
                        <PedidoCard key={p.id} pedido={p} coluna={col} onAvancar={avancarStatus} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {entregues.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-400">Entregues ({entregues.length})</span>
              </div>
              <div className="space-y-2">
                {entregues.map(p => (
                  <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">#{String(p.numero).padStart(3, '0')}</span>
                      {p.cliente && <span className="text-sm text-zinc-400">{p.cliente.nome}</span>}
                      <span className="text-xs text-zinc-600">{p.itens.length} {p.itens.length === 1 ? 'item' : 'itens'}</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-400">{fmtBRL(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
