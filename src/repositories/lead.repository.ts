import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Lead, LeadRelations} from '../models';

export class LeadRepository extends DefaultCrudRepository<
  Lead,
  typeof Lead.prototype.id,
  LeadRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Lead, dataSource);
  }
}
