import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private findUserByIdUseCase: FindUserByIdUseCase
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findUserByIdUseCase.execute(id);
    
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }
    
    const updatedUser = await this.userRepository.update(id, updateUserDto);
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return updatedUser;
  }
} 