import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosGateway } from './pedidos.gateway';

type CriarPedidoDto = {
  cliente?: { nome: string; telefone?: string };
  itens: Array<{
    produtoId: string;
    quantidade: number;
    observacao?: string;
    adicionaisIds?: string[];
  }>;
  observacao?: string;
  pagamento: { metodo: string };
};

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private gateway: PedidosGateway,
  ) {}

  private readonly include = {
    cliente: true,
    itens: {
      include: {
        produto: { select: { id: true, nome: true } },
        adicionais: {
          include: { adicional: { select: { id: true, nome: true } } },
        },
      },
    },
    pagamento: true,
  } as const;

  findAll() {
    return this.prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      include: this.include,
    });
  }

  findOne(id: string) {
    return this.prisma.pedido.findUnique({ where: { id }, include: this.include });
  }

  async create(dto: CriarPedidoDto) {
    const ids = dto.itens.map(i => i.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: ids } },
      include: { adicionais: true },
    });
    const pm = new Map(produtos.map(p => [p.id, p]));

    let total = 0;
    for (const item of dto.itens) {
      const p = pm.get(item.produtoId);
      if (!p) throw new Error(`Produto ${item.produtoId} não encontrado`);
      let preco = Number(p.preco);
      for (const aId of item.adicionaisIds ?? []) {
        const a = p.adicionais.find(x => x.id === aId);
        if (a) preco += Number(a.preco);
      }
      total += preco * item.quantidade;
    }

    const pedido = await this.prisma.pedido.create({
      data: {
        total,
        observacao: dto.observacao,
        ...(dto.cliente?.nome && {
          cliente: { create: { nome: dto.cliente.nome, telefone: dto.cliente.telefone } },
        }),
        itens: {
          create: dto.itens.map(item => {
            const p = pm.get(item.produtoId)!;
            return {
              produtoId: item.produtoId,
              quantidade: item.quantidade,
              precoUnit: Number(p.preco),
              observacao: item.observacao,
              ...(item.adicionaisIds?.length && {
                adicionais: {
                  create: item.adicionaisIds.map(aId => {
                    const a = p.adicionais.find(x => x.id === aId)!;
                    return { adicionalId: aId, preco: Number(a.preco) };
                  }),
                },
              }),
            };
          }),
        },
        pagamento: { create: { metodo: dto.pagamento.metodo as any, valor: total } },
      },
      include: this.include,
    });

    this.gateway.emitNovoPedido(pedido);
    return pedido;
  }

  async updateStatus(id: string, status: string) {
    const pedido = await this.prisma.pedido.update({
      where: { id },
      data: { status: status as any },
      include: this.include,
    });
    this.gateway.emitPedidoAtualizado(pedido);
    return pedido;
  }
}
