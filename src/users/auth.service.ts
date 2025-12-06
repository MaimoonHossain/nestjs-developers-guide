import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    const userExist = await this.usersService.find(email);

    if (userExist.length) {
      throw new BadRequestException('email in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hashedPassword.toString('hex');

    return this.usersService.create(email, result);
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new BadRequestException('user not found');
    }

    const [salt, storedHashedPassword] = user.password.split('.');

    const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHashedPassword !== hashedPassword.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
