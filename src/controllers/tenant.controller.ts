import {inject} from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get, getModelSchemaRef, param, patch, post, put, requestBody, response
} from '@loopback/rest';
import {
  TokenServiceBindings,
  UserServiceBindings
} from '../keys';
import {Tenant} from '../models';
import {Credentials, TenantRepository} from '../repositories';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';

export class TenantController {
  constructor(
    @repository(TenantRepository)
    public tenantRepository: TenantRepository,

    // @inject('service.user.service')
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    // @inject('service.jwt.service')
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,

  ) { }

  @post('/tenants')
  @response(200, {
    description: 'Tenant model instance',
    content: {'application/json': {schema: getModelSchemaRef(Tenant)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {
            title: 'NewTenant',
            exclude: ['id'],
          }),
        },
      },
    })
    tenant: Omit<Tenant, 'id'>,
  ): Promise<Tenant> {
    return this.tenantRepository.create(tenant);
  }

  @get('/tenants/count')
  @response(200, {
    description: 'Tenant model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Tenant) where?: Where<Tenant>,
  ): Promise<Count> {
    return this.tenantRepository.count(where);
  }

  @get('/tenants')
  @response(200, {
    description: 'Array of Tenant model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Tenant, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Tenant) filter?: Filter<Tenant>,
  ): Promise<Tenant[]> {
    return this.tenantRepository.find(filter);
  }

  @patch('/tenants')
  @response(200, {
    description: 'Tenant PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {partial: true}),
        },
      },
    })
    tenant: Tenant,
    @param.where(Tenant) where?: Where<Tenant>,
  ): Promise<Count> {
    return this.tenantRepository.updateAll(tenant, where);
  }

  @get('/tenants/{id}')
  @response(200, {
    description: 'Tenant model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Tenant, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Tenant, {exclude: 'where'}) filter?: FilterExcludingWhere<Tenant>
  ): Promise<Tenant> {
    return this.tenantRepository.findById(id, filter);
  }

  @patch('/tenants/{id}')
  @response(204, {
    description: 'Tenant PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Tenant, {partial: true}),
        },
      },
    })
    tenant: Tenant,
  ): Promise<void> {
    await this.tenantRepository.updateById(id, tenant);
  }

  @put('/tenants/{id}')
  @response(204, {
    description: 'Tenant PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() tenant: Tenant,
  ): Promise<void> {
    await this.tenantRepository.replaceById(id, tenant);
  }

  @del('/tenants/{id}')
  @response(204, {
    description: 'Tenant DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.tenantRepository.deleteById(id);
  }

  //
  @post('/tenants/login')
  @response(200, {
    description: 'Tenant User Login',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody() credentials: Credentials,
  ): Promise<{token: string}> {
    console.log(credentials);
    // make sure tenant exists
    const tenant: Tenant = await this.userService.verifyTenant(credentials);
    console.log(tenant);
    // make sure user exist,password should be valid
    const user = await this.userService.verifyCredentials(credentials);
    // console.log(user);
    // eslint-disable-next-line @typescript-eslint/await-thenable
    const userProfile = await this.userService.convertToUserProfile(user);

    console.log(userProfile);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token: token});
  }
}

