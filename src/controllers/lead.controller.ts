import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {intercept} from '@loopback/context';
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
import {LeadInterceptorInterceptor} from '../interceptors';
import {Lead} from '../models';
import {LeadRepository} from '../repositories';
import {LeadService} from '../services';

export class LeadController {
  constructor(
    @repository(LeadRepository)
    public leadRepository: LeadRepository,
    @service(LeadService)
    public leadService: LeadService
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
    return this.leadRepository.create(lead);
  }

  // @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  @get('/leads/db', {
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
  async find(@param.query.string('dbName') dbName: string,
    @param.filter(Lead) filter?: Filter<Lead>): Promise<Lead[]> {
    return this.leadService.findLead(dbName);
  }

  // @intercept(LeadInterceptorInterceptor.BINDING_KEY)
  // @get('/leadsBor', {
  //   security: OPERATION_SECURITY_SPEC,
  //   responses: {
  //     '200': {
  //       description: 'Array of Lead model instances',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             type: 'array',
  //             items: getModelSchemaRef(Lead, {includeRelations: true}),
  //           },
  //         },
  //       },
  //     },
  //   },
  // })
  // @authenticate('jwt')
  // async findBor(@param.filter(Lead) filter?: Filter<Lead>): Promise<Lead[]> {
  //   return this.leadService.findLead('BorDB');
  // }


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


