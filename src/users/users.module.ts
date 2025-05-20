import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersService } from './application/services/users.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { User } from './domain/entities/user.entity';
import { AbilityModule } from '../ability/ability.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AbilityModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {} 