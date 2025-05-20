import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityGuard } from './ability.guard';
import { AbilityFactory, Action } from '../ability.factory';
import { UserRole } from '../../users/domain/entities/user.entity';
import { CHECK_ABILITY } from '../decorators/check-ability.decorator';

const mockReflector = () => ({
  get: jest.fn(),
});

const mockAbilityFactory = () => ({
  createForUser: jest.fn(),
});

const mockAbility = {
  can: jest.fn(),
};

describe('AbilityGuard', () => {
  let guard: AbilityGuard;
  let reflector: any;
  let abilityFactory: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbilityGuard,
        { provide: Reflector, useFactory: mockReflector },
        { provide: AbilityFactory, useFactory: mockAbilityFactory },
      ],
    }).compile();

    guard = module.get<AbilityGuard>(AbilityGuard);
    reflector = module.get<Reflector>(Reflector);
    abilityFactory = module.get<AbilityFactory>(AbilityFactory);
  });

  describe('canActivate', () => {
    it('should return true when no ability rules are defined', async () => {
      const context = createMockExecutionContext();
      
      reflector.get.mockReturnValue([]);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(CHECK_ABILITY, context.getHandler());
    });

    it('should return false when no user is in the request', async () => {
      const context = createMockExecutionContextWithoutUser();
      
      reflector.get.mockReturnValue([{ action: Action.Read, subject: 'User' }]);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(false);
      expect(reflector.get).toHaveBeenCalledWith(CHECK_ABILITY, context.getHandler());
    });

    it('should allow access when user has the required abilities', async () => {
      const mockUser = { id: '1', role: UserRole.ADMIN };
      const context = createMockExecutionContext(mockUser);
      
      const requiredRule = { action: Action.Read, subject: 'User' };
      reflector.get.mockReturnValue([requiredRule]);
      
      abilityFactory.createForUser.mockReturnValue(mockAbility);
      mockAbility.can.mockReturnValue(true);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith(CHECK_ABILITY, context.getHandler());
      expect(abilityFactory.createForUser).toHaveBeenCalledWith(mockUser);
      expect(mockAbility.can).toHaveBeenCalledWith(requiredRule.action, requiredRule.subject);
    });

    it('should throw ForbiddenException when user does not have the required abilities', async () => {
      const mockUser = { id: '1', role: UserRole.USER };
      const context = createMockExecutionContext(mockUser);
      
      const requiredRule = { action: Action.Create, subject: 'User' };
      reflector.get.mockReturnValue([requiredRule]);
      
      abilityFactory.createForUser.mockReturnValue(mockAbility);
      mockAbility.can.mockReturnValue(false);

      await expect(guard.canActivate(context as any)).rejects.toThrow(ForbiddenException);
      expect(reflector.get).toHaveBeenCalledWith(CHECK_ABILITY, context.getHandler());
      expect(abilityFactory.createForUser).toHaveBeenCalledWith(mockUser);
      expect(mockAbility.can).toHaveBeenCalledWith(requiredRule.action, requiredRule.subject);
    });

    it('should check conditions when provided in the rule', async () => {
      const mockUser = { id: '1', role: UserRole.USER };
      const context = createMockExecutionContext(mockUser);
      
      const requiredRule = { 
        action: Action.Update, 
        subject: 'User',
        conditions: { id: '1' } 
      };
      reflector.get.mockReturnValue([requiredRule]);
      
      abilityFactory.createForUser.mockReturnValue(mockAbility);
      mockAbility.can.mockReturnValue(true);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(mockAbility.can).toHaveBeenCalledWith(
        requiredRule.action, 
        requiredRule.subject, 
        requiredRule.conditions
      );
    });

    it('should check each field individually when fields are provided in the rule', async () => {
      const mockUser = { id: '1', role: UserRole.MANAGER };
      const context = createMockExecutionContext(mockUser);
      
      const requiredRule = { 
        action: Action.Update, 
        subject: 'User',
        fields: ['name', 'email'] 
      };
      reflector.get.mockReturnValue([requiredRule]);
      
      abilityFactory.createForUser.mockReturnValue(mockAbility);
      mockAbility.can.mockReturnValue(true);

      const result = await guard.canActivate(context as any);

      expect(result).toBe(true);
      expect(mockAbility.can).toHaveBeenCalledWith(requiredRule.action, requiredRule.subject, 'name');
      expect(mockAbility.can).toHaveBeenCalledWith(requiredRule.action, requiredRule.subject, 'email');
    });
  });
});

function createMockExecutionContext(user = { id: '1', role: UserRole.ADMIN }) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
    getHandler: () => ({}),
  };
}

function createMockExecutionContextWithoutUser() {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: null,
      }),
    }),
    getHandler: () => ({}),
  };
} 