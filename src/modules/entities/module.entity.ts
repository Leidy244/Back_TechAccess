
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from '../../features/roles/entities/role.entity';

@Entity('modules')
export class ModuleEntity {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  @ManyToMany(() => Role, role => role.modules)
  roles!: Role[];
}