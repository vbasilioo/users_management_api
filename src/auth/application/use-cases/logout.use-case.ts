import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { TokenBlacklistService } from '../../token-blacklist.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async execute(token: string): Promise<ApiResponseDto<null>> {
    if (!token) {
      return ApiResponseDto.success('No active session');
    }
    
    await this.tokenBlacklistService.addToBlacklist(token);
    return ApiResponseDto.success('Successfully logged out');
  }
} 