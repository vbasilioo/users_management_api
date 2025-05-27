import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../../application/services/users.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { AbilityFactory } from '../../../ability/ability.factory';
import { AbilityGuard } from '../../../ability/guards/ability.guard';
import { Reflector } from '@nestjs/core';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../../application/use-cases/remove-user.use-case';
import { FindAllUsersDto } from '../../application/dtos/find-all-users.dto';
import { ForbiddenException } from '@nestjs/common';

const mockUsersService = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCreateUserUseCase = () => ({
  execute: jest.fn(),
});

const mockFindAllUsersUseCase = () => ({
  execute: jest.fn(),
});

const mockFindUserByIdUseCase = () => ({
  execute: jest.fn(),
});

const mockUpdateUserUseCase = () => ({
  execute: jest.fn(),
});

const mockRemoveUserUseCase = () => ({
  execute: jest.fn(),
});

const mockAbilityFactory = () => ({
  createForUser: jest.fn().mockReturnValue({
    can: jest.fn().mockReturnValue(true)
  })
});

const mockReflector = () => ({
  get: jest.fn().mockReturnValue([]),
  getAllAndOverride: jest.fn(),
});

jest.mock('../../../ability/guards/ability.guard', () => ({
  AbilityGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: any;
  let createUserUseCase: any;
  let findAllUsersUseCase: any;
  let findUserByIdUseCase: any;
  let updateUserUseCase: any;
  let removeUserUseCase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
        {
          provide: CreateUserUseCase,
          useFactory: mockCreateUserUseCase,
        },
        {
          provide: FindAllUsersUseCase,
          useFactory: mockFindAllUsersUseCase,
        },
        {
          provide: FindUserByIdUseCase,
          useFactory: mockFindUserByIdUseCase,
        },
        {
          provide: UpdateUserUseCase,
          useFactory: mockUpdateUserUseCase,
        },
        {
          provide: RemoveUserUseCase,
          useFactory: mockRemoveUserUseCase,
        },
        {
          provide: AbilityFactory,
          useFactory: mockAbilityFactory,
        },
        {
          provide: Reflector,
          useFactory: mockReflector,
        },
      ],
    })
    .overrideGuard(AbilityGuard)
    .useValue({ canActivate: () => true })
    .compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    findAllUsersUseCase = module.get<FindAllUsersUseCase>(FindAllUsersUseCase);
    findUserByIdUseCase = module.get<FindUserByIdUseCase>(FindUserByIdUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    removeUserUseCase = module.get<RemoveUserUseCase>(RemoveUserUseCase);
  });

  describe('findAll', () => {
    it('should return all users when admin requests', async () => {
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'User 1',
          email: 'user1@example.com',
          password: 'hashedPassword1',
          role: UserRole.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'User 2',
          email: 'user2@example.com',
          password: 'hashedPassword2',
          role: UserRole.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockPaginatedResult = {
        data: mockUsers,
        meta: {
          total: 2,
          currentPage: 1,
          perPage: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };

      findAllUsersUseCase.execute.mockResolvedValue(mockPaginatedResult);

      const mockRequest = {
        user: {
          id: '1',
          role: UserRole.ADMIN,
        },
      };

      const query: FindAllUsersDto = {
        page: 1,
        perPage: 10,
        search: 'user'
      };

      const result = await usersController.findAll(query, mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data).toEqual(mockPaginatedResult);
      expect(findAllUsersUseCase.execute).toHaveBeenCalledWith(query);
    });

    it('should return error when regular user tries to access all users', async () => {
      const mockRequest = {
        user: {
          id: '2',
          role: UserRole.USER,
        },
      };

      const query: FindAllUsersDto = {};

      await expect(usersController.findAll(query, mockRequest)).rejects.toThrow(ForbiddenException);
      expect(findAllUsersUseCase.execute).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const mockUser: User = {
        id: '1',
        name: 'User 1',
        email: 'user1@example.com',
        password: 'hashedPassword1',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      findUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const mockRequest = {
        user: {
          id: '1',
          role: UserRole.ADMIN,
        },
      };

      const result = await usersController.findOne('1', mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User retrieved successfully');
      expect(result.data).toEqual(mockUser);
      expect(findUserByIdUseCase.execute).toHaveBeenCalledWith('1');
    });

    it('should return error when regular user tries to access another user profile', async () => {
      const mockRequest = {
        user: {
          id: '2',
          role: 'user',
        },
      };

      const result = await usersController.findOne('1', mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeTruthy();
      expect(result.message).toBe('You can only view your own profile');
      expect(findUserByIdUseCase.execute).not.toHaveBeenCalled();
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
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      createUserUseCase.execute.mockResolvedValue(mockCreatedUser);

      const result = await usersController.create(createUserDto);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User created successfully');
      expect(result.data).toEqual(mockCreatedUser);
      expect(createUserUseCase.execute).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockUpdatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'user1@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateUserUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const mockRequest = {
        user: {
          id: '1',
          role: UserRole.ADMIN,
        },
      };

      const result = await usersController.update('1', updateUserDto, mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User updated successfully');
      expect(result.data).toEqual(mockUpdatedUser);
      expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', updateUserDto);
    });

    it('should return error when regular user tries to update another user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const mockRequest = {
        user: {
          id: '2',
          role: 'user',
        },
      };

      const result = await usersController.update('1', updateUserDto, mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeTruthy();
      expect(result.message).toBe('You can only update your own profile');
      expect(updateUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should remove role from updateDto when non-admin tries to update role', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        role: UserRole.ADMIN,
      };

      const mockUpdatedUser = {
        id: '1',
        name: 'Updated Name',
        email: 'user1@example.com',
        role: UserRole.MANAGER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      updateUserUseCase.execute.mockResolvedValue(mockUpdatedUser);

      const mockRequest = {
        user: {
          id: '1',
          role: UserRole.MANAGER,
        },
      };

      const result = await usersController.update('1', updateUserDto, mockRequest);
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User updated successfully');
      expect(result.data).toEqual(mockUpdatedUser);
      
      const expectedDto = { name: 'Updated Name' };
      expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', expectedDto);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      removeUserUseCase.execute.mockResolvedValue(undefined);

      const result = await usersController.remove('1');
      
      expect(result).toBeInstanceOf(ApiResponseDto);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User deleted successfully');
      expect(removeUserUseCase.execute).toHaveBeenCalledWith('1');
    });
  });
}); 