import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Ficha } from '../../entities/ficha.entity';
import { FichaDto, UpdateFichaDto } from '../../dtos/ficha.dto';

@Injectable()
export class FichaService {
  constructor(
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
  ) {}

  // Crear una nueva ficha
  async create(createFichaDto: FichaDto): Promise<Ficha> {
    try {
      // Verificar si ya existe una ficha con el mismo número
      const existingFicha = await this.fichaRepository.findOne({
        where: { numficha: createFichaDto.numficha },
      });
      if (existingFicha) {
        throw new BadRequestException(`Ya existe una ficha con el número ${createFichaDto.numficha}`);
      }

      // Crear instancia y asignar valores (mapeando fechaFin del DTO a fechafin de la entidad)
      const ficha = new Ficha();
      ficha.numficha = createFichaDto.numficha;
      ficha.programa = createFichaDto.programa;
      ficha.nivelFormacion = createFichaDto.nivelFormacion;
      ficha.jornada = createFichaDto.jornada;
      ficha.fechaInicio = createFichaDto.fechaInicio;
      ficha.fechafin = createFichaDto.fechafin; 
      ficha.estado = createFichaDto.estado || 'Activa';

      return await this.fichaRepository.save(ficha);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Error al crear la ficha: ' + error.message);
    }
  }

  // Obtener todas las fichas con paginación y filtro opcional de inactivas
  async findAll(options: {
    page: number;
    limit: number;
    includeInactivas: boolean;
  }): Promise<{
    data: Ficha[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit, includeInactivas } = options;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Ficha> = {};
    if (!includeInactivas) {
      where.estado = 'Activa';
    }

    const [data, total] = await this.fichaRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    return { data, total, page, limit };
  }

  // Buscar una ficha por ID
  async findOne(id: number): Promise<Ficha> {
    const ficha = await this.fichaRepository.findOne({ where: { id } });
    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${id} no encontrada`);
    }
    return ficha;
  }

  // Actualizar una ficha
  async update(id: number, updateFichaDto: UpdateFichaDto): Promise<Ficha> {
    const ficha = await this.findOne(id);

    // Si se intenta cambiar el número de ficha, verificar que no exista otro con ese número
    if (updateFichaDto.numficha && updateFichaDto.numficha !== ficha.numficha) {
      const existingFicha = await this.fichaRepository.findOne({
        where: { numficha: updateFichaDto.numficha },
      });
      if (existingFicha) {
        throw new BadRequestException(`Ya existe una ficha con el número ${updateFichaDto.numficha}`);
      }
      ficha.numficha = updateFichaDto.numficha;
    }

    // Actualizar el resto de campos si vienen en el DTO
    if (updateFichaDto.programa !== undefined) ficha.programa = updateFichaDto.programa;
    if (updateFichaDto.nivelFormacion !== undefined) ficha.nivelFormacion = updateFichaDto.nivelFormacion;
    if (updateFichaDto.jornada !== undefined) ficha.jornada = updateFichaDto.jornada;
    if (updateFichaDto.fechaInicio !== undefined) ficha.fechaInicio = updateFichaDto.fechaInicio;
    if (updateFichaDto.fechafin !== undefined) ficha.fechafin = updateFichaDto.fechafin;
    if (updateFichaDto.estado !== undefined) ficha.estado = updateFichaDto.estado;

    return await this.fichaRepository.save(ficha);
  }

  // Eliminar (lógica o físicamente) una ficha
  async remove(id: number, soft: boolean): Promise<void> {
    const ficha = await this.findOne(id);

    if (soft) {
      // Eliminación lógica: cambiar estado a 'Inactiva'
      ficha.estado = 'Inactiva';
      await this.fichaRepository.save(ficha);
    } else {
      // Eliminación física
      await this.fichaRepository.remove(ficha);
    }
  }

  // Métodos adicionales de búsqueda

  // Buscar fichas por programa (búsqueda parcial)
  async findByPrograma(programa: string): Promise<Ficha[]> {
    return this.fichaRepository.find({
      where: { programa: Like(`%${programa}%`) },
      order: { id: 'DESC' },
    });
  }

  // Buscar una ficha por número exacto
  async findByNumFicha(numFicha: string): Promise<Ficha> {
    const ficha = await this.fichaRepository.findOne({
      where: { numficha: numFicha },
    });
    if (!ficha) {
      throw new NotFoundException(`Ficha con número ${numFicha} no encontrada`);
    }
    return ficha;
  }

  // Método opcional: obtener fichas activas
  async findActivas(): Promise<Ficha[]> {
    return this.fichaRepository.find({
      where: { estado: 'Activa' },
      order: { id: 'DESC' },
    });
  }

  // Obtener los aprendices vinculados a una ficha
  async findAprendices(id: number): Promise<any[]> {
    const ficha = await this.fichaRepository.findOne({
      where: { id },
      relations: ['users', 'users.roles'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${id} no encontrada`);
    }

    // Retorna solo los usuarios que tienen el rol 'Aprendiz'
    const users = ficha.users || [];
    return users.filter(user => 
      user.roles?.some(role => role.name.toUpperCase() === 'APRENDIZ')
    );
  }
}