import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, Req, Query, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';
import { VehiculosService } from 'src/features/vehiculos/services/vehiculos/vehiculos.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateVehiculoDto } from '../../../vehiculos/dtos/vehiculo.dto';

@ApiBearerAuth()
//@Modules('vehiculo')
//@UseGuards(JwtAuthGuard, ModulesGuard)
@Controller('vehiculos')
export class VehiculosController {

    constructor(private vehiculosService: VehiculosService){}

    @Get()
    getVehiculo(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ){
        return this.vehiculosService.findAll({ page, limit });
    }

    @Get(':vehiId')
    findOne(@Param('vehiId', ParseIntPipe) vehiId: number){
        return this.vehiculosService.findOne(vehiId);
    }

    @Post()
    createVehiculo(@Body() payload: CreateVehiculoDto, @Req() req){
        return this.vehiculosService.create(payload, req.user); //revisar en caso de fallos
    }

    @Put(':vehiId')
    updateVehiculo (@Param('vehiId', ParseIntPipe) vehiId: number, @Body() payloadUpdate : CreateVehiculoDto){
        return this.vehiculosService.updateVehiculo(vehiId, payloadUpdate)
    }

    @Delete(':vehiId')
    deleteVehiculo(@Param('vehiId', ParseIntPipe) vehiId: number){
        this.vehiculosService.deleteVehiculo(vehiId)
    }
}