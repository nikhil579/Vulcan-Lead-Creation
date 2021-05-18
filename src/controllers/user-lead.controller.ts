import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  Lead,
} from '../models';
import {UserRepository} from '../repositories';

export class UserLeadController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/leads', {
    responses: {
      '200': {
        description: 'Array of User has many Lead',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Lead)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Lead>,
  ): Promise<Lead[]> {
    return this.userRepository.leads(id).find(filter);
  }

  @post('/users/{id}/leads', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(Lead)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lead, {
            title: 'NewLeadInUser',
            exclude: ['id'],
            optional: ['createdBy']
          }),
        },
      },
    }) lead: Omit<Lead, 'id'>,
  ): Promise<Lead> {
    return this.userRepository.leads(id).create(lead);
  }

  @patch('/users/{id}/leads', {
    responses: {
      '200': {
        description: 'User.Lead PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Lead, {partial: true}),
        },
      },
    })
    lead: Partial<Lead>,
    @param.query.object('where', getWhereSchemaFor(Lead)) where?: Where<Lead>,
  ): Promise<Count> {
    return this.userRepository.leads(id).patch(lead, where);
  }

  @del('/users/{id}/leads', {
    responses: {
      '200': {
        description: 'User.Lead DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Lead)) where?: Where<Lead>,
  ): Promise<Count> {
    return this.userRepository.leads(id).delete(where);
  }
}
