import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User, UserRole } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

const mockUserRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      userRepository.findAll.mockResolvedValue(mockUsers);

      const result = await usersService.findAll();
      expect(result).toEqual(mockUsers);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await usersService.findById('1');
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(usersService.findById('999')).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('999');
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('user1@example.com');
      expect(result).toEqual(mockUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('user1@example.com');
    });

    it('should throw NotFoundException if user not found by email', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(usersService.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'Password123!',
        role: UserRole.USER,
      };
      
      const mockCreatedUser = {
        id: '3',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      const result = await usersService.create(createUserDto);
      expect(result).toEqual(mockCreatedUser);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'Password123!',
        role: UserRole.USER,
      };
      
      userRepository.findByEmail.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(usersService.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      
      const mockUser = {
        id: '1',
        name: 'Original Name',
        email: 'user1@example.com',
        role: UserRole.USER,
      };
      
      const mockUpdatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(mockUpdatedUser);

      const result = await usersService.update('1', updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw NotFoundException if user to update not found', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      
      userRepository.findById.mockResolvedValue(null);

      await expect(usersService.update('999', updateUserDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('999');
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if updating to an email that already exists for another user', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };
      
      const mockUser = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
      };
      
      const mockExistingUser = {
        id: '2',
        name: 'User 2',
        email: 'existing@example.com',
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.findByEmail.mockResolvedValue(mockExistingUser);

      await expect(usersService.update('1', updateUserDto)).rejects.toThrow(ConflictException);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(updateUserDto.email);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(true);

      await usersService.remove('1');
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user to delete not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(usersService.remove('999')).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('999');
      expect(userRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if deletion fails', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(false);

      await expect(usersService.remove('1')).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });
  });
}); 