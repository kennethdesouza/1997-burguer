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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status } = await req.json()
    const data = await db.pedido.update({
      where: { id },
      data: { status },
      include,
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}
