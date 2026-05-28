import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProdutosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.produto.findMany({
      orderBy: { createdAt: 'asc' },
      include: { categoria: { select: { id: true, nome: true } } },
    });
  }

  create(data: { nome: string; descricao?: string; preco: number; imagem?: string; categoriaId: string; disponivel?: boolean }) {
    return this.prisma.produto.create({
      data,
      include: { categoria: { select: { id: true, nome: true } } },
    });
  }

  update(id: string, data: { nome?: string; descricao?: string; preco?: number; imagem?: string; categoriaId?: string; disponivel?: boolean }) {
    return this.prisma.produto.update({
      where: { id },
      data,
      include: { categoria: { select: { id: true, nome: true } } },
    });
  }

  remove(id: string) {
    return this.prisma.produto.delete({ where: { id } });
  }
}
