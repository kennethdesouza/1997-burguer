import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const data = await db.categoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { produtos: true } } },
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb()
    const body = await req.json()
    const data = await db.categoria.create({ data: body })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar categoria' }, { status: 500 })
  }
}
