import { Controller, Get, Post, Put, Delete, UseGuards, Param, ParseIntPipe, Req, Body, Patch, Query, DefaultValuePipe } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { CreateDispositivoDto, UpdateDispositivo } from 'src/features/dispositivos/dtos/dispositivo.dto';
import { Dispositivo } from 'src/features/dispositivos/entities/dispositivo.entity';
import { DispositivosService } from 'src/features/dispositivos/services/dispositivos/dispositivos.service';
import { Repository } from 'typeorm';

@ApiBearerAuth()
//@Modules( 'dispositivo' )
//@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller( 'dispositivos' )
export class DispositivosController {
  
    constructor(private DispositivosService: DispositivosService) {}

    @Get()
    getVehiculo(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ){
        return this.DispositivosService.findAll({ page, limit });
    }

    @Get(':dispoId')
    findOne(
      
      @Param('dispoId', ParseIntPipe) dispoId: number){

      return this.DispositivosService.findOne(dispoId);
    }
    @Post()
    createDispositivo(
      
      @Body() payload: CreateDispositivoDto,
      @Req() req){

      return this.DispositivosService.createDispositivo(payload, req.user);
    }
    @Patch(':dispoId')
    updateDispositivo(

      @Param('dispoId', ParseIntPipe) dispoId: number,
      @Body() payloadUpdate : UpdateDispositivo){

      return this.DispositivosService.updateDispositivo(dispoId, payloadUpdate)
    }

    @Delete(':dispoId')
    deleteDispositivo(@Param( 'dispoId', ParseIntPipe) dispoId: number){
      this.DispositivosService.deletedispositivo(dispoId)
    }

}
