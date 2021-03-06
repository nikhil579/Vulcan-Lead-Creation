import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {PasswordHasherBindings} from '../keys';
import {Tenant, User} from '../models';
import {TenantRepository} from '../repositories';
import {Credentials, UserRepository} from '../repositories/user.repository';
import {BcryptHasher} from './hash.password';

export class MyUserService implements UserService<User, Credentials> {
  constructor(
    @repository(TenantRepository)
    public tenantRepository: TenantRepository,

    @repository(UserRepository)
    public userRepository: UserRepository,

    // @inject('service.hasher')
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,
  ) { }


  async verifyCredentials(credentials: Credentials): Promise<User> {
    // implement this method
    const foundUser = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (!foundUser) {
      throw new HttpErrors.NotFound('user not found');
    }
    const passwordMatched = await this.hasher.comparePassword(
      credentials.password,
      foundUser.password,
    );
    if (!passwordMatched)
      throw new HttpErrors.Unauthorized('password is not valid');
    return foundUser;
  }

  async verifyTenant(credentials: Credentials): Promise<Tenant> {
    // implement this method
    const foundTenant = await this.tenantRepository.findOne({
      where: {and: [{tenantName: credentials.tenantName}, {databaseName: credentials.databaseName}]}
    });
    if (!foundTenant) {
      throw new HttpErrors.NotFound('Tenant not found');
    }
    return foundTenant;
  }

  convertToUserProfile(user: User): UserProfile {
    let userName = '';
    if (user.firstName) userName = user.firstName;
    if (user.lastName) {
      userName = user.firstName
        ? `${user.firstName} ${user.lastName}`
        : user.lastName;
    }
    return {
      [securityId]: user.id!.toString(),
      name: userName,
      id: user.id,
      email: user.email,
      permissions: user.permissions,
      databaseName: user.databaseName,
    };
  }


}
