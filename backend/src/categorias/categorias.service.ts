import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.categoria.findMany({
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { produtos: true } } },
    });
  }

  create(data: { nome: string; ativa?: boolean }) {
    return this.prisma.categoria.create({ data });
  }

  update(id: string, data: { nome?: string; ativa?: boolean; ordem?: number }) {
    return this.prisma.categoria.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.categoria.delete({ where: { id } });
  }
}
