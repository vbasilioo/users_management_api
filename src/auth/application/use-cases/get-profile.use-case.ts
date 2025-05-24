import { Injectable } from '@nestjs/common';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class GetProfileUseCase {
  async execute(user: User): Promise<ApiResponseDto<User>> {
    const { password, ...userWithoutPassword } = user;
    return ApiResponseDto.success('User profile retrieved successfully', userWithoutPassword as User);
  }
} 