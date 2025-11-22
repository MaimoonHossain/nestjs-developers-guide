import { Expose } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class UserDto {
  @Expose()
  id: number;

  @Expose()
  email: string;
}
