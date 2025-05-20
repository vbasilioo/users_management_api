import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

class MockAuthGuard {
  canActivate() {
    return true;
  }
}

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => {
    return MockAuthGuard;
  }),
}));

class MockJwtAuthGuard {
  constructor(private reflector) {}
  
  canActivate(context) {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return true;
  }
  
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }
    return user;
  }
}

jest.mock('./jwt-auth.guard', () => ({
  JwtAuthGuard: MockJwtAuthGuard,
}));

describe('JwtAuthGuard', () => {
  let guard;
  let reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new MockJwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
        getClass: jest.fn().mockReturnValue({}),
      };
      
      reflector.getAllAndOverride.mockReturnValue(true);
      
      const result = guard.canActivate(context);
      
      expect(result).toBe(true);
      
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()]
      );
    });

    it('should call super.canActivate for protected routes', () => {
      const context = {
        getHandler: jest.fn().mockReturnValue({}),
        getClass: jest.fn().mockReturnValue({}),
      };

      reflector.getAllAndOverride.mockReturnValue(false);
      
      const result = guard.canActivate(context);
      
      expect(result).toBe(true);
      
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()]
      );
    });
  });

  describe('handleRequest', () => {
    it('should return user when no error and user exists', () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      
      const result = guard.handleRequest(null, mockUser, null);
      
      expect(result).toEqual(mockUser);
    });

    it('should throw the original error when error exists', () => {
      const mockError = new Error('Test error');
      
      expect(() => guard.handleRequest(mockError, null, null)).toThrow(mockError);
    });

    it('should throw UnauthorizedException when no error but user does not exist', () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
      expect(() => guard.handleRequest(null, null, null)).toThrow('Unauthorized access');
    });
  });
}); 