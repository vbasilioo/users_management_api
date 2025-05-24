import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class RemoveUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private findUserByIdUseCase: FindUserByIdUseCase
  ) {}

  async execute(id: string): Promise<void> {
    await this.findUserByIdUseCase.execute(id);
    
    const deleted = await this.userRepository.delete(id);
    
    if (!deleted) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
} 