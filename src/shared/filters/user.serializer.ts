import { User } from 'src/user/model/user.model';

export function serializeUserRequest(user: any): Partial<User> | null {
  if (!user) return null;

  if (user.dataValues) {
    const { password, ...userData } = user.dataValues;
    return userData;
  }

  const { password, ...userData } = user;
  return userData;
}
