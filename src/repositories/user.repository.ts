import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {TenantDataSource} from '../datasources';
import {Lead, User, UserRelations} from '../models';
import {LeadRepository} from './lead.repository';

export type Credentials = {
  email: string;
  password: string;
  permissions: string[];
  tenantName: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly leads: HasManyRepositoryFactory<Lead, typeof User.prototype.id>;

  constructor(@inject('datasources.tenant') dataSource: TenantDataSource, @repository.getter('LeadRepository') protected leadRepositoryGetter: Getter<LeadRepository>,) {
    super(User, dataSource);
    //console.log('USER REPO : ');
    this.leads = this.createHasManyRepositoryFactoryFor('leads', leadRepositoryGetter,);
  }
}
