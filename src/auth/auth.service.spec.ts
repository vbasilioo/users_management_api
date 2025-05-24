import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/application/services/users.service';
import { LoginDto } from './dtos/login.dto';
import { UserRole } from '../users/domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { TokenBlacklistService } from './token-blacklist.service';

jest.mock('bcrypt');

const mockUsersService = () => ({
  findByEmail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockTokenBlacklistService = () => ({
  addToBlacklist: jest.fn(),
});

describe('Auth UseCases', () => {
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;
  let getProfileUseCase: GetProfileUseCase;
  let usersService: any;
  let jwtService: any;
  let tokenBlacklistService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        LogoutUseCase,
        GetProfileUseCase,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: TokenBlacklistService, useFactory: mockTokenBlacklistService },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    getProfileUseCase = module.get<GetProfileUseCase>(GetProfileUseCase);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    tokenBlacklistService = module.get<TokenBlacklistService>(TokenBlacklistService);
    
    jest.clearAllMocks();
  });

  describe('LoginUseCase', () => {
    it('should return JWT token when login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockToken = 'jwt-token';

      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue(mockToken);

      const result = await loginUseCase.execute(loginDto);

      expect(result.error).toBeFalsy();
      expect(result.message).toBe('Successfully logged in');
      expect(result.data).toEqual({ 
        accessToken: mockToken,
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: UserRole.USER
        }
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
      });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      usersService.findByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('LogoutUseCase', () => {
    it('should add token to blacklist when logout is called', async () => {
      const token = 'test-token';
      
      tokenBlacklistService.addToBlacklist.mockResolvedValue(undefined);
      
      const result = await logoutUseCase.execute(token);
      
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('Successfully logged out');
      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(token);
    });
    
    it('should return success message when no token is provided', async () => {
      const result = await logoutUseCase.execute('');
      
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('No active session');
      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });
  });

  describe('GetProfileUseCase', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await getProfileUseCase.execute(mockUser);
      
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('User profile retrieved successfully');
      expect(result.data).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.USER,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.data).not.toHaveProperty('password');
    });
  });
}); 