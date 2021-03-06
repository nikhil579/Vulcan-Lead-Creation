import {Entity, hasMany, model, property} from '@loopback/repository';
import {Lead} from './lead.model';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;
  username: string | undefined;

  @property({
    type: 'array',
    itemType: 'string',
  })
  permissions: string[];

  @hasMany(() => Lead, {keyTo: 'createdBy'})
  leads: Lead[];

  @property({
    type: 'array',
    itemType: 'string',
  })
  memberList: string[];

  @property({
    type: 'string',
    required: true,
  })
  tenantName: string;

  @property({
    type: 'string',
    required: true,
  })
  databaseName: string;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
