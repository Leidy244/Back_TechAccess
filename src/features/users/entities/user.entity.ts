import { Role } from '../../roles/entities/role.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';
import { Ficha } from '../../ficha/entities/ficha.entity';
import { Dispositivo } from '../../dispositivos/entities/dispositivo.entity';
import { Acceso } from '../../reg-acceso/entities/acceso.entity'; 

import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 255 })
    lastName!: string;

    @Column({ type: 'varchar', length: 255 })
    docType!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    docNumber!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    telephone!: string;

    @Column({ nullable: true })
    FamTelephone!: string;

    @Column({ default: 'activo' })
    state!: string;

    @Column({ type: 'varchar', nullable: true })
    password!: string | null;

    @Column({ default: true })
    isActive!: boolean;

    @ManyToMany(() => Role, role => role.users)
    @JoinTable({ name: 'user_roles' })
    roles!: Role[];

    @ManyToOne(() => Ficha, (ficha) => ficha.users, { nullable: true })
    fichas!: Ficha | null;

    @OneToMany(() => Dispositivo, (dispositivo) => dispositivo.usuario)
    dispositivos!: Dispositivo[];

    @OneToMany(() => Acceso, (acceso) => acceso.usuario)
    accesos!: Acceso[];

    @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.usuario)
    vehiculos!: Vehiculo[];
}