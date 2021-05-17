import {authenticate} from '@loopback/authentication';
import {OPERATION_SECURITY_SPEC} from '@loopback/authentication-jwt';
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
import {PermissionKeys} from '../authorization/permission-keys';
import {Job} from '../models';
import {JobRepository} from '../repositories';

export class JobController {
  constructor(
    @repository(JobRepository)
    public jobRepository: JobRepository,
  ) { }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @post('/jobs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Job model instance',
        content: {'application/json': {schema: getModelSchemaRef(Job)}},
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKeys.CreateJob]})
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Job, {
            title: 'NewJob',
            exclude: ['id'],
          }),
        },
      },
    })
    job: Omit<Job, 'id'>,
  ): Promise<Job> {
    return this.jobRepository.create(job);
  }

  @get('/jobs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Array of Job model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Job, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKeys.AccessAuthFeature]})
  async find(@param.filter(Job) filter?: Filter<Job>): Promise<Job[]> {
    return this.jobRepository.find(filter);
  }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @patch('/jobs', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'Job PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKeys.UpdateJob]})
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Job, {partial: true}),
        },
      },
    })
    job: Job,
    @param.where(Job) where?: Where<Job>,
  ): Promise<Count> {
    return this.jobRepository.updateAll(job, where);
  }

  // admin should be authenticated
  // only admin can access this route
  // Please run x and y function before this (using interceptor)
  @del('/jobs/{id}', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '204': {
        description: 'Job DELETE success',
      },
    },
  })
  @authenticate('jwt', {required: [PermissionKeys.DeleteJob]})
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.jobRepository.deleteById(id);
  }
}
