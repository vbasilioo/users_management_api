import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { FindAllUsersDto } from '../../application/dtos/find-all-users.dto';
import { PaginatedResponse } from '../../domain/types/paginated-response.type';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(params?: FindAllUsersDto): Promise<PaginatedResponse<User>> {
    const { search, page = 1, perPage = 10 } = params || {};
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.where('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const totalPages = Math.ceil(total / perPage);

    queryBuilder
      .skip((page - 1) * perPage)
      .take(perPage)
      .orderBy('user.createdAt', 'DESC');

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        total,
        currentPage: page,
        perPage,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...userData } = createUserDto;
    
    const hashedPassword = await this.hashPassword(password);
    
    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    return this.userRepository.save(newUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.findById(id);
    
    if (!user) {
      return null;
    }
    
    const updatedUser = { ...user };
    
    if (updateUserDto.name) {
      updatedUser.name = updateUserDto.name;
    }
    
    if (updateUserDto.email) {
      updatedUser.email = updateUserDto.email;
    }
    
    if (updateUserDto.role) {
      updatedUser.role = updateUserDto.role;
    }
    
    if (updateUserDto.password) {
      updatedUser.password = await this.hashPassword(updateUserDto.password);
    }
    
    return this.userRepository.save(updatedUser);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result && result.affected ? result.affected > 0 : false;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
} 