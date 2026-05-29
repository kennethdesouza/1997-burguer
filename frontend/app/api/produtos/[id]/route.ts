import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const include = { categoria: { select: { id: true, nome: true } } }

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const data = await db.produto.update({ where: { id }, data: body, include })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.produto.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao deletar produto' }, { status: 500 })
  }
}
