import {Entity, model, property} from '@loopback/repository';

@model()
export class Lead extends Entity {
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
  title: string;

  @property({
    type: 'string',
  })
  createdBy?: string;

  @property({
    type: 'string',
  })
  modifiedBy?: string;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: Date;

  @property({
    type: 'date',
  })
  lastModifiedAt?: Date;

  constructor(data?: Partial<Lead>) {
    super(data);
  }
}

export interface LeadRelations {
  // describe navigational properties here
}

export type LeadWithRelations = Lead & LeadRelations;
