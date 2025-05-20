import { SetMetadata } from '@nestjs/common';
import { Action, AppAbility } from '../ability.factory';

export interface RequiredRule {
  action: Action;
  subject: string;
  fields?: string[];
  conditions?: any;
}

export type PolicyHandler = (ability: AppAbility) => boolean;

export const CHECK_ABILITY = 'check_ability';

export const CheckAbility = (requirementOrHandler: RequiredRule | PolicyHandler | RequiredRule[]) => 
  SetMetadata(CHECK_ABILITY, requirementOrHandler); 