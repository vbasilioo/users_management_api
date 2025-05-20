import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: false })
  error: boolean;

  @ApiProperty({ example: 'Operation completed successfully' })
  message: string;

  @ApiProperty({ example: null, nullable: true })
  data: T | null;

  constructor(error: boolean, message: string, data: T | null = null) {
    this.error = error;
    this.message = message;
    this.data = data;
  }

  static success<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, message, data);
  }

  static error<T>(message: string, data?: T): ApiResponseDto<T> {
    return new ApiResponseDto<T>(true, message, data);
  }
} 