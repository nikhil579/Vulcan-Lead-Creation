import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject, intercept} from '@loopback/context';
import {service} from '@loopback/core';
import {
  CountSchema,
  Filter,
  repository
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody
} from '@loopback/rest';
import {PermissionKeys} from '../authorization/permission-keys';
import {LeadInterceptorInterceptor} from '../interceptors';
import {Lead} from '../models';
import {LeadRepository} from '../repositories';
import {basicAuthorization, LeadService} from '../services';

export class LeadController {
  constructor(
    @repository(LeadRepository)
    public leadRepository: LeadRepository,
    @service(LeadService)
    public leadService: LeadService,
    @inject('MY_USER_PROFILE') public authorizedUserProfile: any
  ) { }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  @post('/leads', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Lead model instance',
        content: {'application/json': {schema: getModelSchemaRef(Lead)}},
      },
    },
  })
  @authenticate('jwt')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lead, {
            title: 'NewLead',
            exclude: ['id', 'createdBy', 'createdAt', 'lastModifiedBy', 'lastModifiedAt'],
          }),
        },
      },
    })
    lead: Omit<Lead, 'id'>,
  ): Promise<Lead> {
    return this.leadService.create(lead, this.authorizedUserProfile.databaseName);
  }

  @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  @get('/leads', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Lead model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Lead, {includeRelations: true}),
            },
          },
        },
      },
    },
  })

  @authenticate('jwt')
  @authorize({allowedRoles: [PermissionKeys.Admin], voters: [basicAuthorization]})
  async find(@param.filter(Lead) filter?: Filter<Lead>): Promise<Lead[]> {
    //console.log("FIND JWT", this.authorizedUserProfile);
    // const credentials = this.jwtStrategy.getUserProfile(request);
    // console.log(credentials);
    // const user = await this.userService.verifyCredentials(credentials);
    // const userProfile = this.userService.convertToUserProfile(user);
    return this.leadService.findLead(this.authorizedUserProfile.databaseName, filter);
  }

  // async find(@param.filter(Lead) filter?: Filter<Lead>): Promise<Lead[]> {
  //   return this.leadRepository.find(filter);


  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  @patch('/leads/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Lead PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lead, {
            partial: true,
            exclude: ['id', 'createdBy', 'createdAt', 'lastModifiedBy', 'lastModifiedAt'],
          }),
        },
      },
    })
    lead: Lead,
  ): Promise<void> {
    await this.leadRepository.updateById(id, lead);
  }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  @del('/leads/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Lead DELETE success',
      },
    },
  })
  @authenticate('jwt')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.leadRepository.deleteById(id);
  }
}


