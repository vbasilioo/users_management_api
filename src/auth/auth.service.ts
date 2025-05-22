import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/application/services/users.service';
import { LoginDto } from './dtos/login.dto';
import { ApiResponseDto } from '../common/dtos/api-response.dto';
import { User } from '../users/domain/entities/user.entity';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(loginDto: LoginDto): Promise<ApiResponseDto<{ accessToken: string; user: Partial<User> }>> {
    const { email, password } = loginDto;
    
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    
    const { password: _, ...userResponse } = await this.usersService.findByEmail(email);
    
    return ApiResponseDto.success('Successfully logged in', { 
      accessToken,
      user: {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        role: userResponse.role
      }
    });
  }

  async logout(token: string): Promise<ApiResponseDto<null>> {
    if (!token) {
      return ApiResponseDto.success('No active session');
    }
    
    await this.tokenBlacklistService.addToBlacklist(token);
    return ApiResponseDto.success('Successfully logged out');
  }

  async getProfile(user: User): Promise<ApiResponseDto<User>> {
    const { password, ...userWithoutPassword } = user;
    return ApiResponseDto.success('User profile retrieved successfully', userWithoutPassword as User);
  }
} 