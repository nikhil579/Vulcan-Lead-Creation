import {HttpErrors} from '@loopback/rest';
import * as isEmail from 'isemail';
import {PermissionKeys} from '../authorization/permission-keys';
import {Credentials} from '../repositories/index';
export function validateCredentials(credentials: Credentials) {
  if (!isEmail.validate(credentials.email)) {
    throw new HttpErrors.UnprocessableEntity('invalid Email');
  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity(
      'password length should be greater than 8',
    );
  }
  if (credentials.permissions.length == 0) {
    throw new HttpErrors.UnprocessableEntity(
      'permission should not be empty',
    );
  }
  if (credentials.permissions.length > 1) {
    throw new HttpErrors.UnprocessableEntity(
      'permission cannot be more than one',
    );
  }

  credentials.permissions.forEach((element, index) => {
    if (!(element in PermissionKeys)) {
      throw new HttpErrors.UnprocessableEntity(
        'permission should be Admin, Manager, Concierge or Broker',
      );
    }
  });
}
