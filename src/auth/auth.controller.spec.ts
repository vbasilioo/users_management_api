import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginDto } from './dtos/login.dto';
import { ApiResponseDto } from '../common/dtos/api-response.dto';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';

const mockLoginUseCase = () => ({
  execute: jest.fn(),
});

const mockLogoutUseCase = () => ({
  execute: jest.fn(),
});

const mockGetProfileUseCase = () => ({
  execute: jest.fn(),
});

describe('AuthController', () => {
  let authController: AuthController;
  let loginUseCase: any;
  let logoutUseCase: any;
  let getProfileUseCase: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useFactory: mockLoginUseCase,
        },
        {
          provide: LogoutUseCase,
          useFactory: mockLogoutUseCase,
        },
        {
          provide: GetProfileUseCase,
          useFactory: mockGetProfileUseCase,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    logoutUseCase = module.get<LogoutUseCase>(LogoutUseCase);
    getProfileUseCase = module.get<GetProfileUseCase>(GetProfileUseCase);
  });

  describe('login', () => {
    it('should return a JWT token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = ApiResponseDto.success('Successfully logged in', {
        accessToken: 'jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER'
        }
      });

      loginUseCase.execute.mockResolvedValue(mockResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('Successfully logged in');
      expect(result.data).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'USER'
        }
      });
      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
    });

    it('should pass through any errors from the login use case', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const mockError = new Error('Invalid credentials');
      loginUseCase.execute.mockRejectedValue(mockError);

      await expect(authController.login(loginDto)).rejects.toThrow(mockError);
      expect(loginUseCase.execute).toHaveBeenCalledWith(loginDto);
    });
  });
}); 