import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Vehiculo } from 'src/features/vehiculos/entities/vehiculo.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVehiculoDto, UpdateVehiculoDto } from 'src/features/vehiculos/dtos/vehiculo.dto';
import { User } from 'src/features/users/entities/user.entity';

@Injectable()
export class VehiculosService {

    constructor(
        @InjectRepository (Vehiculo) 
        private vehiRepo: Repository<Vehiculo>,
        
        @InjectRepository (User)
        private userRepo: Repository<User>,

    ){}

    async findAll(options?: { page?: number; limit?: number }){
        const page = options?.page || 1;
        const limit = options?.limit || 100;
        const skip = (page - 1) * limit;

        const [data, total] = await this.vehiRepo.findAndCount({
            relations: ['usuario'],
            skip,
            take: limit,
            order: { id: 'DESC' },
        });

        return { data, total, page, limit };
    }

    async findByPlaca(placa: string){
        const vehiculo = await this.vehiRepo.findOne({ where: {placa}, relations: ['usuario'] })

        if (!vehiculo) {
            throw new NotFoundException(`Vehículo con placa ${placa} no encontrado`);
        }

        return vehiculo;
    }

    async findByModelo(modelo: string){
        const vehiculo = await this.vehiRepo.find({ where: {modelo}})

        if (!vehiculo.length){
            throw new NotFoundException(`Vehículo modelo ${modelo} no encontrado`)
        }

        return vehiculo;
    }

    async findOne(id: number){
        const vehiculo = await this.vehiRepo.findOne({
            where: {id: id},
            relations: ['usuario'],
        })

        if (!vehiculo) {
            throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
        }

        return vehiculo;
    }

    async findByColor(color: string){
        const vehiculos = await this.vehiRepo.find({ //con find siempre devuelve un array
            where: { color }
        })

        if (!vehiculos.length) {//usaar length cuando se traiga una array
            throw new NotFoundException(`No hay vehículos de color ${color}`);
        }

        return vehiculos;
    }

    //Para buscar vehiculo por usuario
    async findByUser(userId: number) {
        
    const vehiculos = await this.vehiRepo.find({
        where: {
            usuario: {
                id: userId
            }
        },
        relations: ['usuario']
    });

    if (!vehiculos.length) {
        throw new NotFoundException('Este usuario no tiene vehículos');
    }

    return vehiculos;
    }

    async create(dto: CreateVehiculoDto, user?: User) {
        const { usuarioId, ...VehiculoData } = dto;

        const existe = await this.vehiRepo.findOne({
            where: { placa: dto.placa }
        });

        if (existe) {
            throw new BadRequestException('La placa ya está registrada');
        }

        let usuario: User | null | undefined = user;
        
        // Si no se pasó el objeto usuario o el ID no coincide, lo buscamos
        if (!usuario || usuario.id !== usuarioId) {
            usuario = await this.userRepo.findOne({
                where: { id: usuarioId }
            });
        }

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const vehiculo = this.vehiRepo.create({
            ...VehiculoData,
            usuario
        });

        return await this.vehiRepo.save(vehiculo);
    }
async updateVehiculo(id: number, updateVehiculo: UpdateVehiculoDto){

    const { placa, tipoVehiculo, marca, ...vehiculoData} = updateVehiculo;

    const vehiculo = await this.vehiRepo.findOne({
        where: {id},
        relations: ['usuario']
    })

    if (!vehiculo) {
        throw new NotFoundException('vehiculo no encontrado');
    }

    this.vehiRepo.merge(vehiculo, vehiculoData); //Para actualizar campos basicos

    // opcional: actualizar campos específicos
    if (placa) vehiculo.placa = placa;
    if (tipoVehiculo) vehiculo.tipoVehiculo = tipoVehiculo;
    if (marca) vehiculo.marca = marca;

    

    return this.vehiRepo.save(vehiculo);
}

 deleteVehiculo(idVehiculo: number) {
        return this.vehiRepo.delete(idVehiculo);
    }
}