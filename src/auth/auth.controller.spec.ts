import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ApiResponseDto } from '../common/dtos/api-response.dto';

const mockAuthService = () => ({
  login: jest.fn(),
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useFactory: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a JWT token on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = ApiResponseDto.success('Successfully logged in', {
        accessToken: 'jwt-token',
      });

      authService.login.mockResolvedValue(mockResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(result.error).toBeFalsy();
      expect(result.message).toBe('Successfully logged in');
      expect(result.data).toEqual({ accessToken: 'jwt-token' });
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should pass through any errors from the auth service', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const mockError = new Error('Invalid credentials');
      authService.login.mockRejectedValue(mockError);

      await expect(authController.login(loginDto)).rejects.toThrow(mockError);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
}); 