import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {get, getJsonSchemaRef, HttpErrors, post, requestBody} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import * as _ from 'lodash';
import {PermissionKeys} from '../authorization/permission-keys';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings
} from '../keys';
import {User} from '../models';
import {Credentials, TenantRepository, UserRepository} from '../repositories';
import {basicAuthorization, validateCredentials} from '../services';
import {BcryptHasher} from '../services/hash.password';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {OPERATION_SECURITY_SPEC} from '../utils/security-spec';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(TenantRepository)
    public tenantRepository: TenantRepository,

    // @inject('service.hasher')
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    // @inject('service.user.service')
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    // @inject('service.jwt.service')
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }

  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          schema: getJsonSchemaRef(User),
        },
      },
    },
  })
  @authenticate('jwt')
  @authorize({allowedRoles: [PermissionKeys.Admin], voters: [basicAuthorization]})
  async signup(@requestBody() userData: User) {
    const foundTenant = await this.userService.verifyTenant(userData);
    if (!foundTenant) {
      throw new HttpErrors.NotFound('Tenant not found');
    }
    console.log("TENANT FOUND", foundTenant);
    validateCredentials(_.pick(userData, ['email', 'password', 'permissions', 'tenantName', 'databaseName']));
    const uniqueEmail = await this.userRepository.findOne({
      where: {email: userData.email}
    })
    // console.log("Unique email", uniqueEmail?.email);
    // console.log("User email", userData.email);
    if (uniqueEmail?.email == userData.email) {
      throw new HttpErrors.Conflict('Email value is already taken');
    }
    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    return savedUser;
  }

  @post('/admin/login', {
    responses: {
      '200': {
        description: 'Token',
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
      },
    },
  })

  async login(
    @requestBody() credentials: Credentials,
  ): Promise<{token: string}> {
    // make sure user exist,password should be valid
    console.log("Credentials", credentials);
    const userPermission = await this.userRepository.findOne({
      where: {email: credentials.email}
    })
    console.log(userPermission);
    if (userPermission?.permissions[0] != "Admin") {
      throw new HttpErrors.NotFound('Only Admin is allowed to login from this route');
    }
    else {
      const user = await this.userService.verifyCredentials(credentials);
      // console.log(user);
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const userProfile = await this.userService.convertToUserProfile(user);
      // console.log(userProfile);

      const token = await this.jwtService.generateToken(userProfile);
      return Promise.resolve({token: token});
    }

  }


  @get('/users/me', {
    security: OPERATION_SECURITY_SPEC,
    responses: {
      '200': {
        description: 'The current user profile',
        content: {
          'application/json': {
            schema: getJsonSchemaRef(User),
          },
        },
      },
    },
  })
  // old syntax was -> @authenticate('jwt', {required: [PermissionKeys.Admin]})
  @authenticate('jwt')

  async me(
    @inject(AuthenticationBindings.CURRENT_USER)
    currentUser: UserProfile,
  ): Promise<UserProfile> {
    return Promise.resolve(currentUser);
  }


  // mock function to check where Admin is logged in or not
  @authenticate('jwt')
  @authorize({allowedRoles: [PermissionKeys.Admin], voters: [basicAuthorization]})
  @get('/if-user-is-allowed')
  ifUserAllowed(): string {
    return 'Yes';
  }
}
