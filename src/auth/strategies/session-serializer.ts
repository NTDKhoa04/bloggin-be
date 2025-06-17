import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/user/model/user.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }
  serializeUser(user: User, done: (err: Error | null, user: string) => void) {
console.log('Serialize user:', user); // debug    
done(null, user.id);
  }
  async deserializeUser(
    payload: string,
    done: (err: Error | null, user: User) => void,
  ) {
console.log('Deserializing user with ID:', payload); // debug    
const res = await this.userService.findUserById(payload);
console.log('Found user:', res); // debug
    done(null, res);
  }
}
