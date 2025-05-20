import { Injectable } from '@nestjs/common';
import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';
import { User, UserRole } from '../users/domain/entities/user.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects = string | 'all';
export type AppAbility = MongoAbility;

@Injectable()
export class AbilityFactory {
  createForUser(user: User): AppAbility {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.role === UserRole.ADMIN) {
      can(Action.Manage, 'all');
    } else if (user.role === UserRole.MANAGER) {
      can(Action.Read, 'User');
      
      can(Action.Update, 'User');
      cannot(Action.Update, 'User', 'role');
      
      cannot(Action.Create, 'User');
      cannot(Action.Delete, 'User');
    } else {
      can(Action.Read, 'User', { id: { $eq: user.id } });
      can(Action.Update, 'User', { id: { $eq: user.id } });
      cannot(Action.Update, 'User', 'role');
    }

    return build();
  }
} 