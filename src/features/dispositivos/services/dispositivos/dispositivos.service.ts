import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDispositivoDto, UpdateDispositivo } from 'src/features/dispositivos/dtos/dispositivo.dto';
import { Dispositivo } from 'src/features/dispositivos/entities/dispositivo.entity';
import { User } from 'src/features/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DispositivosService {

    constructor(
        @InjectRepository (Dispositivo)
        private RepositoryDispositivo: Repository<Dispositivo>,

        @InjectRepository (User)
        private RepositoryUser: Repository<User>,

    ){}

    async findAll(options?: { page?: number; limit?: number }){
        const page = options?.page || 1;
        const limit = options?.limit || 100;
        const skip = (page - 1) * limit;

        const [data, total] = await this.RepositoryDispositivo.findAndCount({
            relations: ['usuario'],
            skip,
            take: limit,
            order: { id: 'DESC' },
        });

        return { data, total, page, limit };
    }

    async findByTipoDispositivo(tipoDispositivo: string){

        const tipo = await this.RepositoryDispositivo.find({ where: {tipoDispositivo}, relations: ['usuario']})

        return tipo;
    }

    async findByMarca(marca: string){

        const marcaD = await this.RepositoryDispositivo.find({ where : {marca}, relations: ['usuario']})

        return marcaD;
    }

    async findOne(id: number){

        const dispositivo = await this.RepositoryDispositivo.findOne({
            where: {id: id},
            relations: [ 'usuario' ],
        })

        if (!dispositivo) {
            throw new NotFoundException(`dispositivo con id ${id} no encontrado`);
        }

        return dispositivo;
    }

    async findByColor(color: string){
        
        const colorD = await this.RepositoryDispositivo.find({ where: {color}, relations: ['usuario']})

        return colorD;
    }

    async findbyUser(userId: number){

        const userDispositivo = await this.RepositoryDispositivo.find({ where: {usuario: {id: userId}}, relations: ['usuario']})

        if (!userDispositivo.length) {
            throw new NotFoundException ('Este usuario no cuenta con un dispositivo registrado')            
        }
        return userDispositivo;
    }

    async createDispositivo(dto: CreateDispositivoDto, user: User){

        const { usuarioId, ...DispositivoData } = dto;

        const usuario = await this.RepositoryUser.findOne({
            where: {id: usuarioId}
        });

        if (!usuario) {
            throw new NotFoundException( 'Usuario no encontrado' )
        }

        const existente = await this.RepositoryDispositivo.findOne({
        where: { usuario: { id: usuarioId } }
        });

        if (existente) {
        throw new BadRequestException('El usuario ya tiene un dispositivo registrado');
        }
        
        const dispositivo = this.RepositoryDispositivo.create({
            ...DispositivoData,
            usuario 
        });

        return this.RepositoryDispositivo.save(dispositivo) ;
    }

    async updateDispositivo(id: number, updateDisp: UpdateDispositivo){

        const dispositivo = await this.RepositoryDispositivo.findOne({
            where: {id},
            relations: ['usuario']
        });

        if (!dispositivo) {
            throw  new NotFoundException( 'Dispositivo no encontrado' )
        }

        this.RepositoryDispositivo.merge(dispositivo, updateDisp);

        // 🔥 manejar relación manualmente
    if (updateDisp.usuarioId !== undefined) {

        const usuario = await this.RepositoryUser.findOne({
            where: { id: updateDisp.usuarioId }
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        dispositivo.usuario = usuario;
    }

        return this.RepositoryDispositivo.save(dispositivo);
    }

    deletedispositivo(idDispositivo: number) {
        return this.RepositoryDispositivo.delete(idDispositivo);
    }
}

