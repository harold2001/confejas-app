import { DeepPartial } from 'react-hook-form';
import { CreateUserDto } from './create-user.dto';

export interface UpdateUserDto extends DeepPartial<CreateUserDto> {
  id?: string;
}
