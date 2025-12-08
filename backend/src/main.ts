import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './database/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function seedDatabase(app) {
  const userRepository = app.get(getRepositoryToken(User));
  
  // Check if admin user exists
  const adminUser = await userRepository.findOne({ where: { email: 'admin@tournament.my' } });

  if (!adminUser) {
    console.log('Seeding database with initial users...');
    
    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const managerPassword = await bcrypt.hash('manager123', saltRounds);

    const usersToCreate = [
      {
        email: 'admin@tournament.my',
        password_hash: adminPassword,
        name: 'Tournament Administrator',
        role: 'admin',
      },
      {
        email: 'ahmad@fcpj.my',
        password_hash: managerPassword,
        name: 'Ahmad bin Hassan',
        role: 'manager',
      },
      {
        email: 'lim@subangwarriors.my',
        password_hash: managerPassword,
        name: 'Lim Chee Kong',
        role: 'manager',
      },
    ];

    const userEntities = userRepository.create(usersToCreate);
    await userRepository.save(userEntities);
    console.log('Database seeding complete.');
  } else {
    console.log('Database already seeded. Skipping.');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  app.enableCors(); // Allow frontend to connect

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Seed the database with initial users
  await seedDatabase(app);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
