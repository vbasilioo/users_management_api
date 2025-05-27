import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { FindAllUsersDto } from '../dtos/find-all-users.dto';
import { PaginatedResponse } from '../../domain/types/paginated-response.type';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(params?: FindAllUsersDto): Promise<PaginatedResponse<User>> {
    return this.userRepository.findAll(params);
  }
} 