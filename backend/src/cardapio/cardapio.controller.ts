import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('cardapio')
export class CardapioController {
  constructor(private prisma: PrismaService) {}

  @Get()
  get() {
    return this.prisma.categoria.findMany({
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
    });
  }
}
