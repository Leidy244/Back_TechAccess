import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from 'src/features/users/entities/user.entity';
import { Ficha } from 'src/features/ficha/entities/ficha.entity';
import { CreateUserDto, UpdateUserDto } from 'src/features/users/dtos/user.dto';
import { RolesService } from 'src/features/roles/services/roles.service';
import { FichaService } from 'src/features/ficha/services/ficha/ficha.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private rolesService: RolesService,
        private fichaService: FichaService,
        private dataSource: DataSource,
    ) { }

    async findAll() {
        return await this.userRepo.find({ relations: ['roles', 'fichas'] });
    }

    async findByEmail(email: string) {
        const user = await this.userRepo.findOne({
            where: { email },
            relations: {
                roles: {
                    modules: true,
                },
            },
        });

        if (!user) {
            throw new NotFoundException(`User ${email} not found`);
        }
        return user;
    }

    async findOne(userId: number) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['roles']
        });
        if (!user) {
            throw new NotFoundException(`User #${userId} not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto) {
        const { roleIds, password, fichasId, ...userData } = createUserDto;

        let hashedPassword: string | null = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const roles = await this.rolesService.findByIds(roleIds);
        if (roles.length !== roleIds.length) {
            throw new NotFoundException('Some roles were not found');
        }

        let fichas: Ficha | null = null;
        if (fichasId) {
            fichas = await this.fichaService.findOne(fichasId);
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1. Crear Usuario
            const newUser = queryRunner.manager.create(User, {
                ...userData,
                password: hashedPassword,
                roles,
                fichas,
            });
            const savedUser = await queryRunner.manager.save(newUser);



            await queryRunner.commitTransaction();
            return savedUser;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error.code === '23505' || error.message?.includes('unique constraint')) {
                throw new ConflictException('El correo o la placa ya se encuentran registrados');
            }
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto) {
        const { roleIds, password, fichasId, ...userData } = updateUserDto;

        const user = await this.userRepo.findOne({
            where: { id },
            relations: ['roles', 'fichas'],
        });

        if (!user) throw new NotFoundException('User not found');

        if (roleIds) {
            const roles = await this.rolesService.findByIds(roleIds);
            if (roles.length !== roleIds.length) {
                throw new NotFoundException('Some roles were not found');
            }
            user.roles = roles;
        }

        if (fichasId !== undefined) {
            if (fichasId === null) {
                user.fichas = null;
            } else {
                user.fichas = await this.fichaService.findOne(fichasId);
            }
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        this.userRepo.merge(user, userData);
        try {
            return await this.userRepo.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('El correo electrónico ya se encuentra registrado');
            }
            throw error;
        }
    }

    async deleteUser(idUser: number) {
        const result = await this.userRepo.delete(idUser);
        if (result.affected === 0) {
            throw new NotFoundException(`User #${idUser} not found`);
        }
        return { message: 'User deleted successfully' };
    }

    // src/features/users/services/users/users.service.ts

    async updatePassword(email: string, password: string) {
        // Buscamos al usuario
        const user = await this.findByEmail(email);

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizamos solo la contraseña
        user.password = password;

        // Guardamos los cambios en PostgreSQL
        return await this.userRepo.save(user);
    }
}