import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Lead} from '../models';
import {LeadRepository} from './lead.repository';

export type Credentials = {
  email: string;
  password: string;
  permissions: string[];
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly leads: HasManyRepositoryFactory<Lead, typeof User.prototype.id>;

  constructor(@inject('datasources.db') dataSource: DbDataSource, @repository.getter('LeadRepository') protected leadRepositoryGetter: Getter<LeadRepository>,) {
    super(User, dataSource);
    this.leads = this.createHasManyRepositoryFactoryFor('leads', leadRepositoryGetter,);
  }
}
