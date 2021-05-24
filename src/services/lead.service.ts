import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Lead} from '../models';
import {TenantRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class LeadService {

  connection: any = {};
  constructor(@repository(TenantRepository)
  public tenantRepository: TenantRepository) {
    // this.createConnection();
  }

  async findLead(tenantDB: string) {
    console.log("In the FINDLEAD", tenantDB);
    const dynamicRepo = await this.createConnection(tenantDB);
    // return this.connection[tenantDB].find();
    return dynamicRepo.find();
  }

  async createConnection(tenantDB: string) {
    // const tenants = await this.tenantRepository.findOne({where: {databaseName: tenantDB}});
    // tenants.forEach((tenant) => {
    const Vulcan = new DbDataSource({
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
    console.log("Creating connection for : ", tenantDB);

    // this.connection[tenantDB ?? "DEFAULT"] = new DefaultCrudRepository(Lead, Vulcan);
    return new DefaultCrudRepository(Lead, Vulcan);

    // })
    // console.log(JSON.stringify(Object.keys(this.connection)));

  }
}
