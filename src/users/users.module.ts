import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersService } from './application/services/users.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { User } from './domain/entities/user.entity';
import { AbilityModule } from '../ability/ability.module';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from './application/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { RemoveUserUseCase } from './application/use-cases/remove-user.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AbilityModule,
  ],
  controllers: [UsersController],
  providers: [
    UserRepository,
    UsersService,
    CreateUserUseCase,
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    UpdateUserUseCase,
    RemoveUserUseCase
  ],
  exports: [UsersService],
})
export class UsersModule {} 