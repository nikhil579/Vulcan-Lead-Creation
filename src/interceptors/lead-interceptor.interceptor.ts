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
import {LeadRepository, UserRepository} from "../repositories";
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
    @repository(UserRepository)
    public userRepository: UserRepository,
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
      console.log(invocationCtx.args[0]);
      // Add pre-invocation logic here
      console.log(invocationCtx.methodName);
      console.log(invocationCtx);
      if (invocationCtx.methodName === 'create') {
        const user = await this.getCurrentUser();
        console.log(invocationCtx.args[0]);
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
      if (invocationCtx.methodName === 'find') {
        console.log("GET");
        console.log(invocationCtx.args[0]);
        const user = await this.getCurrentUser();
        const userRecord = await this.userRepository.find({where: {id: user.id}});
        var filter: any = {};
        console.log(userRecord);
        if (userRecord[0].memberList.length == 1) {
          invocationCtx.args[0].where.createdBy = user.id;
          console.log("Where", invocationCtx.args[0].where);
        }
        if (userRecord[0].memberList.length > 1) {
          filter.or = [];
          userRecord[0].memberList.forEach(element => {
            filter.or.push({createdBy: element});
          });
          invocationCtx.args[0].where = filter;
          console.log(filter);
          console.log("Where", invocationCtx.args[0].where);
        }
      }
      if (invocationCtx.methodName === 'updateById') {
        const user = await this.getCurrentUser();
        const {title} = invocationCtx.args[1];
        // console.log(title);
        invocationCtx.args[1].modifiedBy = user.id;

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
