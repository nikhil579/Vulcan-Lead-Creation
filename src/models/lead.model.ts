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

  constructor(data?: Partial<Lead>) {
    super(data);
  }
}

export interface LeadRelations {
  // describe navigational properties here
}

export type LeadWithRelations = Lead & LeadRelations;
