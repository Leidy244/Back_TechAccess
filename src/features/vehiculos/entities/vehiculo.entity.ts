
import { User } from '../../users/entities/user.entity';
import { 
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn 
} from 'typeorm';

@Entity('vehiculo')
export class Vehiculo {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  placa!: string;

  @Column({ type: 'varchar', length: 100 })
  tipoVehiculo!: string;

  @Column({ type: 'varchar', length: 100 })
  marca!: string;

  @Column({ type: 'varchar', length: 50 })
  color!: string;

  @Column({ type: 'varchar', length: 100 })
  modelo!: string;

  // Muchos vehículos pertenecen a un usuario
  @ManyToOne(() => User, user => user.vehiculos, { onDelete: 'CASCADE' })
  usuario!: User;
}