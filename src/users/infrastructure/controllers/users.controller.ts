import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { User } from '../../domain/entities/user.entity';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { CheckAbility } from '../../../ability/decorators/check-ability.decorator';
import { Action, AppAbility } from '../../../ability/ability.factory';
import { AbilityGuard } from '../../../ability/guards/ability.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Create, User))
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<User>> {
    const user = await this.usersService.create(createUserDto);
    return ApiResponseDto.success('User created successfully', user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Read, User))
  async findAll(): Promise<ApiResponseDto<User[]>> {
    const users = await this.usersService.findAll();
    return ApiResponseDto.success('Users retrieved successfully', users);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Read, User))
  async findOne(@Param('id') id: string, @Req() req): Promise<ApiResponseDto<User>> {
    const currentUser = req.user;
    
    if (currentUser.id !== id && currentUser.role === 'user') {
      return ApiResponseDto.error('You can only view your own profile');
    }
    
    const user = await this.usersService.findById(id);
    return ApiResponseDto.success('User retrieved successfully', user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Update, User))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<ApiResponseDto<User>> {
    const currentUser = req.user;
    
    if (currentUser.id !== id && currentUser.role === 'user') {
      return ApiResponseDto.error('You can only update your own profile');
    }
    
    if (updateUserDto.role && currentUser.role !== 'admin') {
      delete updateUserDto.role;
    }
    
    const user = await this.usersService.update(id, updateUserDto);
    return ApiResponseDto.success('User updated successfully', user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Delete, User))
  async remove(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.usersService.remove(id);
    return ApiResponseDto.success('User deleted successfully');
  }
} 