import {
  AuthenticationBindings
} from '@loopback/authentication';
import {
  Getter,
  inject,
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise
} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {LeadRepository} from "../repositories";
import {MyUserProfile} from '../types';
/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: LeadInterceptorInterceptor.BINDING_KEY}})
export class LeadInterceptorInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${LeadInterceptorInterceptor.name}`;


  constructor(
    @repository(LeadRepository)
    public leadRepository: LeadRepository,

    // dependency inject
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>

  ) { }

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      console.log(invocationCtx.args);
      // Add pre-invocation logic here
      if (invocationCtx.methodName === 'create') {
        const user = await this.getCurrentUser();
        const {title} = invocationCtx.args[0];

        console.log(title);
        invocationCtx.args[0].createdBy = user.id;
        const titleAlreadyExist = await this.leadRepository.find({where: {title}})
        if (titleAlreadyExist.length) {
          throw new HttpErrors.UnprocessableEntity(
            'Title already exist',
          );
        }
      }
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      // Add error handling logic here
      throw err;
    }
  }
}
