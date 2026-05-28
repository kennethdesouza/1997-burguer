import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ProdutosService } from './produtos.service';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() body: { nome: string; descricao?: string; preco: number; imagem?: string; categoriaId: string; disponivel?: boolean }) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { nome?: string; descricao?: string; preco?: number; imagem?: string; categoriaId?: string; disponivel?: boolean }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
