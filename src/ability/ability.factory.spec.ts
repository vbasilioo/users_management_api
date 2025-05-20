import { Test, TestingModule } from '@nestjs/testing';
import { AbilityFactory, Action } from './ability.factory';
import { User, UserRole } from '../users/domain/entities/user.entity';
import { subject } from '@casl/ability';

describe('AbilityFactory', () => {
  let abilityFactory: AbilityFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AbilityFactory],
    }).compile();

    abilityFactory = module.get<AbilityFactory>(AbilityFactory);
  });

  describe('createForUser', () => {
    it('should give admin users full access to all resources', () => {
      const user: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'hashedPassword',
        role: UserRole.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ability = abilityFactory.createForUser(user);

      expect(ability.can(Action.Manage, 'all')).toBe(true);
      expect(ability.can(Action.Read, 'User')).toBe(true);
      expect(ability.can(Action.Create, 'User')).toBe(true);
      expect(ability.can(Action.Update, 'User')).toBe(true);
      expect(ability.can(Action.Delete, 'User')).toBe(true);
    });

    it('should give manager users limited access to user resources', () => {
      const user: User = {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        password: 'hashedPassword',
        role: UserRole.MANAGER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ability = abilityFactory.createForUser(user);

      expect(ability.can(Action.Read, 'User')).toBe(true);
      expect(ability.can(Action.Update, 'User')).toBe(true);
      
      expect(ability.can(Action.Create, 'User')).toBe(false);
      expect(ability.can(Action.Delete, 'User')).toBe(false);
      expect(ability.can(Action.Manage, 'all')).toBe(false);
      
      const canUpdateRole = ability.rules.some(rule => 
        rule.action === Action.Update && 
        rule.subject === 'User' && 
        rule.fields && rule.fields.includes('role') &&
        rule.inverted === true
      );
      expect(canUpdateRole).toBe(true);
    });

    it('should give regular users access only to their own data', () => {
      const user: User = {
        id: '3',
        name: 'Regular User',
        email: 'user@example.com',
        password: 'hashedPassword',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const ability = abilityFactory.createForUser(user);

      const userSubject = subject('User', { id: '3' });
      const otherUserSubject = subject('User', { id: '999' });
      
      expect(ability.can(Action.Read, userSubject)).toBe(true);
      expect(ability.can(Action.Update, userSubject)).toBe(true);
      
      expect(ability.can(Action.Read, otherUserSubject)).toBe(false);
      expect(ability.can(Action.Update, otherUserSubject)).toBe(false);
      
      expect(ability.can(Action.Create, 'User')).toBe(false);
      expect(ability.can(Action.Delete, 'User')).toBe(false);
      expect(ability.can(Action.Manage, 'all')).toBe(false);
    });
  });
}); 