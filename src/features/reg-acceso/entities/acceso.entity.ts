import { User } from '../../users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';

@Entity('accesos')
export class Acceso {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  horaFecha!: Date;

  @Column({ type: 'boolean'}) 
  accion!: boolean;

  @Column({ nullable: true })
  observacion!: string;

   @ManyToOne(() => User, (user) => user.accesos, { onDelete: 'CASCADE' })
  usuario!: User;

}