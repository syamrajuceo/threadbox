import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  GlobalRole,
  UserStatus,
} from '../../../../modules/users/entities/user.entity';

export async function createSuperUser(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash('SecurePassword123!', 10);

  const superUser = userRepository.create({
    email: 'admin@threadbox.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    globalRole: GlobalRole.SUPER_USER,
    status: UserStatus.ACTIVE,
  });

  await userRepository.save(superUser);
  console.log('Super User created successfully!');
}
