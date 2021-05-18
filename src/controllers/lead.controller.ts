import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
import {intercept} from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where
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

export class LeadController {
  constructor(
    @repository(LeadRepository)
    public leadRepository: LeadRepository,
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
            exclude: ['id', 'modifiedBy'],
          }),
        },
      },
    })
    lead: Omit<Lead, 'id'>,
  ): Promise<Lead> {
    return this.leadRepository.create(lead);
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
  async find(@param.filter(Lead) filter?: Filter<Lead>): Promise<Lead[]> {
    return this.leadRepository.find(filter);
  }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @patch('/leads', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Lead PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt')
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lead, {partial: true}),
        },
      },
    })
    lead: Lead,
    @param.where(Lead) where?: Where<Lead>,
  ): Promise<Count> {
    return this.leadRepository.updateAll(lead, where);
  }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
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


  postLead(param: any) {
    console.log(param);
  }
}


