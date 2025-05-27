import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email.use-case';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';
import { FindAllUsersUseCase } from '../use-cases/find-all-users.use-case';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../use-cases/remove-user.use-case';
import { FindAllUsersDto } from '../dtos/find-all-users.dto';
import { PaginatedResponse } from '../../domain/types/paginated-response.type';

@Injectable()
export class UsersService {
  constructor(
    private findUserByEmailUseCase: FindUserByEmailUseCase,
    private findUserByIdUseCase: FindUserByIdUseCase,
    private findAllUsersUseCase: FindAllUsersUseCase,
    private createUserUseCase: CreateUserUseCase,
    private updateUserUseCase: UpdateUserUseCase,
    private removeUserUseCase: RemoveUserUseCase
  ) {}

  async findAll(params?: FindAllUsersDto): Promise<PaginatedResponse<User>> {
    return this.findAllUsersUseCase.execute(params);
  }

  async findById(id: string): Promise<User> {
    return this.findUserByIdUseCase.execute(id);
  }

  async findByEmail(email: string): Promise<User> {
    return this.findUserByEmailUseCase.execute(email);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.createUserUseCase.execute(createUserDto);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.updateUserUseCase.execute(id, updateUserDto);
  }

  async remove(id: string): Promise<void> {
    return this.removeUserUseCase.execute(id);
  }
} 