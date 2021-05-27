import {bind, BindingScope} from '@loopback/core';
import {DataObject, DefaultCrudRepository, Filter, Options, repository} from '@loopback/repository';
import {TenantDataSource} from '../datasources';
import {Lead} from '../models';
import {TenantRepository} from '../repositories';

@bind({scope: BindingScope.SINGLETON})
export class LeadService {

  connection: any = {};
  constructor(@repository(TenantRepository)
  public tenantRepository: TenantRepository) {
  }
  //
  // find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]>;
  async findLead(tenantDB: string, filter?: Filter<Lead>): Promise<Lead[]> {
    //console.log("In the FINDLEAD", tenantDB);
    const dynamicRepo = await this.createConnection(tenantDB);
    // return this.connection[tenantDB].find();
    return dynamicRepo.find(filter);
  }

  async create(entity: DataObject<Lead>, tenantDB: string, options?: Options): Promise<Lead> {
    const dynamicRepo = await this.createConnection(tenantDB);
    return dynamicRepo.create(entity, options);
  }

  async createConnection(tenantDB: string) {
    // const tenants = await this.tenantRepository.findOne({where: {databaseName: tenantDB}});
    // tenants.forEach((tenant) => {
    const DB = new TenantDataSource({
      name: 'mongoDB',
      connector: 'mongodb',
      url: '',
      host: 'localhost',
      port: 27017,
      user: '',
      password: '',
      database: tenantDB,
      useNewUrlParser: true
    });
    //console.log("Creating connection for : ", tenantDB);

    // this.connection[tenantDB ?? "DEFAULT"] = new DefaultCrudRepository(Lead, Vulcan);
    return new DefaultCrudRepository(Lead, DB);

    // })
    // console.log(JSON.stringify(Object.keys(this.connection)));

  }
}
