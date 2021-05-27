import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {TenantDataSource} from '../datasources';
import {Lead, LeadRelations} from '../models';

export class LeadRepository extends DefaultCrudRepository<
  Lead,
  typeof Lead.prototype.id,
  LeadRelations
> {
  constructor(@inject('datasources.tenant') dataSource: TenantDataSource) {
    super(Lead, dataSource);
    //console.log('LEAD REPO : ');
  }
}
