import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../ability.factory';
import { CHECK_ABILITY, RequiredRule, PolicyHandler } from '../decorators/check-ability.decorator';

@Injectable()
export class AbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = this.reflector.get<RequiredRule | PolicyHandler | RequiredRule[]>(
      CHECK_ABILITY,
      context.getHandler(),
    );
    
    if (!handler) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }
    
    const ability = this.caslAbilityFactory.createForUser(user);
    
    let hasAccess = false;

    if (typeof handler === 'function') {
      hasAccess = handler(ability);
    } else if (Array.isArray(handler)) {
      hasAccess = handler.every(rule => {
        const { action, subject, fields, conditions } = rule;
        
        if (conditions) {
          return ability.can(action, subject, conditions);
        }
        
        if (fields) {
          return fields.every(field => ability.can(action, subject, field));
        }
        
        return ability.can(action, subject);
      });
    } else {
      const { action, subject, fields, conditions } = handler;
      
      if (conditions) {
        hasAccess = ability.can(action, subject, conditions);
      } else if (fields) {
        hasAccess = fields.every(field => ability.can(action, subject, field));
      } else {
        hasAccess = ability.can(action, subject);
      }
    }

    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
} 