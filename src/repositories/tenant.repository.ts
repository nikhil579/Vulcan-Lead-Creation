import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {TenantDataSource} from '../datasources';
import {Tenant, TenantRelations} from '../models';

export class TenantRepository extends DefaultCrudRepository<
  Tenant,
  typeof Tenant.prototype.id,
  TenantRelations
> {
  constructor(
    @inject('datasources.tenant') dataSource: TenantDataSource,
  ) {
    super(Tenant, dataSource);
  }
}
