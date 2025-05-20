import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRepository } from './users/infrastructure/repositories/user.repository';
import { UserRole } from './users/domain/entities/user.entity';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

async function createUserIfNotExists(
  userRepository: UserRepository,
  userData: SeedUser,
): Promise<void> {
  const existingUser = await userRepository.findByEmail(userData.email);
  
  if (existingUser) {
    console.log(`User ${userData.email} already exists, skipping...`);
    return;
  }
  
  await userRepository.create(userData);
  console.log(`User ${userData.email} created successfully!`);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get(UserRepository);

  const seedUsers: SeedUser[] = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!',
      role: UserRole.ADMIN,
    },
    {
      name: 'Manager User',
      email: 'manager@example.com',
      password: 'Manager123!',
      role: UserRole.MANAGER,
    },
    {
      name: 'Regular User',
      email: 'user@example.com',
      password: 'User123!',
      role: UserRole.USER,
    },
  ];

  try {
    for (const userData of seedUsers) {
      await createUserIfNotExists(userRepository, userData);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 