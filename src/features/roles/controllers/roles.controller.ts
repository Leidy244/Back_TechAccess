import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    ParseIntPipe,
    HttpCode,
    NotFoundException,
    BadRequestException,
    UseGuards,
    Query,
    DefaultValuePipe,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from '../dtos/role.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Modules } from 'src/auth/decorators/modules.decorator';
import { ModulesGuard } from 'src/auth/guards/modules.guard.guard';

@ApiBearerAuth()
@Modules('roles')
@UseGuards(JwtAuthGuard) // Temporalmente sin ModulesGuard para permitir configuración inicial
// @UseGuards(JwtAuthGuard, ModulesGuard)
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    // Crear rol
    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    async create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    // Listar todos los roles
    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
    ) {
        return this.rolesService.findAll({ page, limit });
    }

    // Obtener un rol por id
    @Get(':id')
    @ApiOperation({ summary: 'Get role by id' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.rolesService.findOne(id);
    }

    // Actualizar un rol
    @Patch(':id')
    @ApiOperation({ summary: 'Update a role by id' })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoleDto: UpdateRoleDto,
    ) {
        return this.rolesService.update(id, updateRoleDto);
    }

    // Eliminar un rol
    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Delete a role by id' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        //opcional: validar si el rol tiene usuarios asignados antes de eliminar
        return this.rolesService.remove(id);
    }
}