import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const db = getDb()
    const data = await db.categoria.findMany({
      where: { ativa: true },
      orderBy: { ordem: 'asc' },
      include: {
        produtos: {
          where: { disponivel: true },
          orderBy: { nome: 'asc' },
          include: {
            adicionais: { where: { disponivel: true }, orderBy: { nome: 'asc' } },
          },
        },
      },
    })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar cardápio' }, { status: 500 })
  }
}
