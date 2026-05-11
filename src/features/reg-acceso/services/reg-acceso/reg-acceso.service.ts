import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Acceso } from '../../entities/acceso.entity';
import { CreateAccesoDto, UpdateAccesoDto } from '../../dtos/acceso.dto';

@Injectable()
export class RegAccesoService {
  constructor(
    @InjectRepository(Acceso)
    private accesoRepository: Repository<Acceso>,
  ) {}

  async create(createAccesoDto: CreateAccesoDto): Promise<Acceso> {
    
  
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const ultimoAcceso = await this.accesoRepository.findOne({
      where: {
        usuario: {
          id: createAccesoDto.usuarioId,
        },
        horaFecha: Between(inicioDia, finDia),
      },
      order: {
        horaFecha: 'DESC',
      },
      relations: ['usuario'],
    });
 
    const nuevaAccion = ultimoAcceso
      ? !ultimoAcceso.accion
      : true;

    const acceso = this.accesoRepository.create({
      horaFecha: new Date(),
      accion: nuevaAccion,
      observacion: createAccesoDto.observacion,
      usuario: {
        id: createAccesoDto.usuarioId,
      },
    });
    return this.accesoRepository.save(acceso);
  }

  async findAll(): Promise<Acceso[]> {
    return this.accesoRepository.find();
  }

  async findOne(id: number): Promise<Acceso> {
    return this.accesoRepository.findOneOrFail({ where: { id } });
}

  async update(id: number, updateAccesoDto: UpdateAccesoDto): Promise<Acceso> {
    await this.accesoRepository.update(id, updateAccesoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.accesoRepository.delete(id);
  }
}