import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { User, UserRole } from '../../domain/entities/user.entity';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { CheckAbility } from '../../../ability/decorators/check-ability.decorator';
import { Action, AppAbility } from '../../../ability/ability.factory';
import { AbilityGuard } from '../../../ability/guards/ability.guard';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '../../application/use-cases/find-all-users.use-case';
import { FindUserByIdUseCase } from '../../application/use-cases/find-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { RemoveUserUseCase } from '../../application/use-cases/remove-user.use-case';
import { FindAllUsersDto } from '../../application/dtos/find-all-users.dto';
import { PaginatedResponse } from '../../domain/types/paginated-response.type';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly removeUserUseCase: RemoveUserUseCase
  ) {}

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
  @CheckAbility((ability: AppAbility) => ability.can(Action.Create, 'User'))
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<User>> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return ApiResponseDto.success('User created successfully', user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with optional search and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term to filter users' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (starts from 1)', type: Number })
  @ApiQuery({ name: 'perPage', required: false, description: 'Number of items per page', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of users with pagination info',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Read, 'User'))
  async findAll(@Query() query: FindAllUsersDto, @Req() req): Promise<ApiResponseDto<PaginatedResponse<User>>> {
    const currentUser = req.user;
    
    if (currentUser.role === UserRole.USER) {
      throw new ForbiddenException('Only admin and manager roles can access the list of all users');
    }
    
    const result = await this.findAllUsersUseCase.execute(query);
    return ApiResponseDto.success('Users retrieved successfully', result);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(AbilityGuard)
  @CheckAbility((ability: AppAbility) => ability.can(Action.Read, 'User'))
  async getProfile(@Req() req): Promise<ApiResponseDto<User>> {
    const currentUser = req.user;
    const { password, ...userWithoutPassword } = currentUser;
    return ApiResponseDto.success('User profile retrieved successfully', userWithoutPassword as User);
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
  @CheckAbility((ability: AppAbility) => ability.can(Action.Read, 'User'))
  async findOne(@Param('id') id: string, @Req() req): Promise<ApiResponseDto<User>> {
    const currentUser = req.user;
    
    if (currentUser.id !== id && currentUser.role === UserRole.USER) {
      return ApiResponseDto.error<User>(
        'You can only view your own profile'
      );
    }
    
    const user = await this.findUserByIdUseCase.execute(id);
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
  @CheckAbility((ability: AppAbility) => ability.can(Action.Update, 'User'))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ): Promise<ApiResponseDto<User>> {
    const currentUser = req.user;
    
    if (currentUser.id !== id && currentUser.role === UserRole.USER) {
      return ApiResponseDto.error<User>(
        'You can only update your own profile'
      );
    }
    
    if (updateUserDto.role && currentUser.role !== UserRole.ADMIN) {
      delete updateUserDto.role;
    }
    
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
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
  @CheckAbility((ability: AppAbility) => ability.can(Action.Delete, 'User'))
  async remove(@Param('id') id: string): Promise<ApiResponseDto<null>> {
    await this.removeUserUseCase.execute(id);
    return ApiResponseDto.success('User deleted successfully');
  }
} 