import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const include = {
  cliente: true,
  itens: {
    include: {
      produto: { select: { id: true, nome: true } },
      adicionais: { include: { adicional: { select: { id: true, nome: true } } } },
    },
  },
  pagamento: true,
}

export async function GET() {
  try {
    const data = await db.pedido.findMany({ orderBy: { createdAt: 'desc' }, include })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar pedidos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const dto = await req.json()

    const ids = dto.itens.map((i: { produtoId: string }) => i.produtoId)
    const produtos = await db.produto.findMany({
      where: { id: { in: ids } },
      include: { adicionais: true },
    })
    const pm = new Map(produtos.map(p => [p.id, p]))

    let total = 0
    for (const item of dto.itens) {
      const p = pm.get(item.produtoId)
      if (!p) return NextResponse.json({ error: `Produto ${item.produtoId} não encontrado` }, { status: 400 })
      let preco = Number(p.preco)
      for (const aId of item.adicionaisIds ?? []) {
        const a = p.adicionais.find((x: { id: string }) => x.id === aId)
        if (a) preco += Number(a.preco)
      }
      total += preco * item.quantidade
    }

    const pedido = await db.pedido.create({
      data: {
        total,
        observacao: dto.observacao,
        ...(dto.cliente?.nome && {
          cliente: { create: { nome: dto.cliente.nome, telefone: dto.cliente.telefone } },
        }),
        itens: {
          create: dto.itens.map((item: { produtoId: string; quantidade: number; observacao?: string; adicionaisIds?: string[] }) => {
            const p = pm.get(item.produtoId)!
            return {
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnit: Number(p.preco),
              observacao: item.observacao,
              ...(item.adicionaisIds?.length && {
                adicionais: {
                  create: item.adicionaisIds.map(aId => {
                    const a = p.adicionais.find((x: { id: string }) => x.id === aId)!
                    return { adicionalId: aId, preco: Number(a.preco) }
                  }),
                },
              }),
            }
          }),
        },
        pagamento: { create: { metodo: dto.pagamento.metodo, valor: total } },
      },
      include,
    })

    return NextResponse.json(pedido, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
