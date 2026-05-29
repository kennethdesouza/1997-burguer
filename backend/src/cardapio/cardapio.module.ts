import { Module } from '@nestjs/common';
import { CardapioController } from './cardapio.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CardapioController],
})
export class CardapioModule {}
