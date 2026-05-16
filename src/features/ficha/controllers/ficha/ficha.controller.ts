import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { FichaService } from '../../services/ficha/ficha.service';
import { FichaDto, UpdateFichaDto } from '../../dtos/ficha.dto';
import { Ficha } from '../../entities/ficha.entity';

@ApiTags('Ficha')
@Controller('ficha')
export class FichaController {
  constructor(private readonly fichaService: FichaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva ficha' })
  @ApiResponse({ status: 201, description: 'Ficha creada exitosamente.', type: Ficha })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiBody({ type: FichaDto })
  create(@Body() createFichaDto: FichaDto) {
    return this.fichaService.create(createFichaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las fichas' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'includeInactivas', required: false, example: false, description: 'Incluir fichas inactivas' })
  @ApiResponse({ status: 200, description: 'Lista de fichas paginada.', type: [Ficha] })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('includeInactivas', new DefaultValuePipe(false), ParseBoolPipe) includeInactivas: boolean,
  ) {
    return this.fichaService.findAll({ page, limit, includeInactivas });
  }

  @Get('activas')
  @ApiOperation({ summary: 'Obtener todas las fichas activas' })
  @ApiResponse({ status: 200, description: 'Lista de fichas activas.', type: [Ficha] })
  findActivas() {
    return this.fichaService.findActivas();
  }

  @Get('programa/:programa')
  @ApiOperation({ summary: 'Buscar fichas por programa' })
  @ApiParam({ name: 'programa', type: String, example: 'ADSO', description: 'Nombre del programa' })
  @ApiResponse({ status: 200, description: 'Lista de fichas que coinciden.', type: [Ficha] })
  findByPrograma(@Param('programa') programa: string) {
    return this.fichaService.findByPrograma(programa);
  }

  @Get('numero/:numFicha')
  @ApiOperation({ summary: 'Buscar una ficha por número' })
  @ApiParam({ name: 'numFicha', type: String, example: '123456', description: 'Número de ficha' })
  @ApiResponse({ status: 200, description: 'Ficha encontrada.', type: Ficha })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada.' })
  findByNumFicha(@Param('numFicha') numFicha: string) {
    return this.fichaService.findByNumFicha(numFicha);
  }

  @Get(':id/aprendices')
  @ApiOperation({ summary: 'Obtener aprendices de una ficha específica' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la ficha' })
  getAprendices(@Param('id', ParseIntPipe) id: number) {
    return this.fichaService.findAprendices(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ficha por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la ficha' })
  @ApiResponse({ status: 200, description: 'Ficha encontrada.', type: Ficha })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fichaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una ficha por ID' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la ficha' })
  @ApiBody({ type: UpdateFichaDto })
  @ApiResponse({ status: 200, description: 'Ficha actualizada.', type: Ficha })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFichaDto: UpdateFichaDto) {
    return this.fichaService.update(id, updateFichaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una ficha' })
  @ApiParam({ name: 'id', type: Number, example: 1, description: 'ID de la ficha' })
  @ApiQuery({ name: 'soft', required: false, example: true, description: 'true = desactivar, false = eliminar físicamente' })
  @ApiResponse({ status: 200, description: 'Ficha eliminada/desactivada.' })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada.' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('soft', new DefaultValuePipe(true), ParseBoolPipe) soft: boolean,
  ) {
    return this.fichaService.remove(id, soft);
  }
}