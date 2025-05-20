import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier for the user' })
  id: string;

  @Column({ length: 100 })
  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The email of the user (must be unique)' })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @ApiProperty({ description: 'The role of the user for access control', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  @ApiProperty({ description: 'When the user was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'When the user was last updated' })
  updatedAt: Date;
} 