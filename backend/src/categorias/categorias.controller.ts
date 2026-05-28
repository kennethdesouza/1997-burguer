import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Post()
  create(@Body() body: { nome: string; ativa?: boolean }) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { nome?: string; ativa?: boolean; ordem?: number }) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
