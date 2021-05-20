import {Entity, model, property} from '@loopback/repository';

@model()
export class Tenant extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id?: string;

  @property({
    type: 'string',
  })
  tenantName?: string;

  @property({
    type: 'string',
  })
  databaseName?: string;

  constructor(data?: Partial<Tenant>) {
    super(data);
  }
}

export interface TenantRelations {
  // describe navigational properties here
}

export type TenantWithRelations = Tenant & TenantRelations;
