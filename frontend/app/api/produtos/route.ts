import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

const include = { categoria: { select: { id: true, nome: true } } }

export async function GET() {
  try {
    const db = getDb()
    const data = await db.produto.findMany({ orderBy: { createdAt: 'asc' }, include })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb()
    const body = await req.json()
    const data = await db.produto.create({ data: body, include })
    return NextResponse.json(data, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
