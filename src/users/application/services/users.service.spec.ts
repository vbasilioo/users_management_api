import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User, UserRole } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserUseCase } from '../use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '../use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '../use-cases/find-user-by-id.use-case';
import { FindUserByEmailUseCase } from '../use-cases/find-user-by-email.use-case';
import { UpdateUserUseCase } from '../use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../use-cases/remove-user.use-case';

const mockUserRepository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockFindUserByEmailUseCase = () => ({
  execute: jest.fn(),
});

const mockFindUserByIdUseCase = () => ({
  execute: jest.fn(),
});

const mockFindAllUsersUseCase = () => ({
  execute: jest.fn(),
});

const mockCreateUserUseCase = () => ({
  execute: jest.fn(),
});

const mockUpdateUserUseCase = () => ({
  execute: jest.fn(),
});

const mockRemoveUserUseCase = () => ({
  execute: jest.fn(),
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository;
  let findUserByEmailUseCase: any;
  let findUserByIdUseCase: any;
  let findAllUsersUseCase: any;
  let createUserUseCase: any;
  let updateUserUseCase: any;
  let removeUserUseCase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
        {
          provide: FindUserByEmailUseCase,
          useFactory: mockFindUserByEmailUseCase,
        },
        {
          provide: FindUserByIdUseCase,
          useFactory: mockFindUserByIdUseCase,
        },
        {
          provide: FindAllUsersUseCase,
          useFactory: mockFindAllUsersUseCase,
        },
        {
          provide: CreateUserUseCase,
          useFactory: mockCreateUserUseCase,
        },
        {
          provide: UpdateUserUseCase,
          useFactory: mockUpdateUserUseCase,
        },
        {
          provide: RemoveUserUseCase,
          useFactory: mockRemoveUserUseCase,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    findUserByEmailUseCase = module.get<FindUserByEmailUseCase>(FindUserByEmailUseCase);
    findUserByIdUseCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    findAllUsersUseCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    removeUserUseCase = module.get<RemoveUserUseCase>(RemoveUserUseCase);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ];
      findAllUsersUseCase.execute.mockResolvedValue(mockUsers);

      const result = await usersService.findAll();
      expect(result).toEqual(mockUsers);
      expect(findAllUsersUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await usersService.findById('1');
      expect(result).toEqual(mockUser);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      findUserByIdUseCase.execute.mockRejectedValue(new NotFoundException(`User with ID "999" not found`));

      await expect(usersService.findById('999')).rejects.toThrow(NotFoundException);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith('999');
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = { id: '1', name: 'User 1', email: 'user1@example.com' };
      findUserByEmailUseCase.execute.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('user1@example.com');
      expect(result).toEqual(mockUser);
      expect(findUserByEmailUseCase.execute).toHaveBeenCalledWith('user1@example.com');
    });

    it('should throw NotFoundException if user not found by email', async () => {
      findUserByEmailUseCase.execute.mockRejectedValue(new NotFoundException(`User with email "nonexistent@example.com" not found`));

      await expect(usersService.findByEmail('nonexistent@example.com')).rejects.toThrow(NotFoundException);
      expect(findUserByEmailUseCase.execute).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
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

      createUserUseCase.execute.mockResolvedValue(mockCreatedUser);

      const result = await usersService.create(createUserDto);
      expect(result).toEqual(mockCreatedUser);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        name: 'New User',
        email: 'existing@example.com',
        password: 'Password123!',
        role: UserRole.USER,
      };
      
      createUserUseCase.execute.mockRejectedValue(new ConflictException('Email already in use'));

      await expect(usersService.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto = {
        name: 'Updated Name',
      };
      
      const mockUpdatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'user1@example.com',
        role: UserRole.USER,
      };

      updateUserUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const result = await usersService.update('1', updateUserDto);
      expect(result).toEqual(mockUpdatedUser);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should throw NotFoundException if user to update not found', async () => {
      updateUserUseCase.execute.mockRejectedValue(new NotFoundException(`User with ID "999" not found`));

      await expect(usersService.update('999', { name: 'Updated Name' })).rejects.toThrow(NotFoundException);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith('999', { name: 'Updated Name' });
    });

    it('should throw ConflictException if updating to an email that already exists for another user', async () => {
      const updateUserDto = {
        email: 'existing@example.com',
      };
      
      updateUserUseCase.execute.mockRejectedValue(new ConflictException('Email already in use'));

      await expect(usersService.update('1', updateUserDto)).rejects.toThrow(ConflictException);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', updateUserDto);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      removeUserUseCase.execute.mockResolvedValue(undefined);

      await usersService.remove('1');
      expect(removeUserUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user to delete not found', async () => {
      removeUserUseCase.execute.mockRejectedValue(new NotFoundException(`User with ID "999" not found`));

      await expect(usersService.remove('999')).rejects.toThrow(NotFoundException);
      expect(removeUserUseCase.execute).toHaveBeenCalledWith('999');
    });

    it('should throw NotFoundException if deletion fails', async () => {
      removeUserUseCase.execute.mockRejectedValue(new NotFoundException(`User with ID "1" not found`));

      await expect(usersService.remove('1')).rejects.toThrow(NotFoundException);
      expect(removeUserUseCase.execute).toHaveBeenCalledWith('1');
    });
  });
}); 