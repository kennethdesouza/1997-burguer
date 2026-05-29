import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProdutosModule } from './produtos/produtos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CardapioModule } from './cardapio/cardapio.module';

@Module({
  imports: [PrismaModule, CategoriasModule, ProdutosModule, PedidosModule, CardapioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
