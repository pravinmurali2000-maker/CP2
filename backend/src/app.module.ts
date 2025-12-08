import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { MatchesModule } from './matches/matches.module';
import { RealtimeModule } from './realtime/realtime.module';
import { User } from './database/entities/user.entity';
import { Tournament } from './database/entities/tournament.entity';
import { Team } from './database/entities/team.entity';
import { Player } from './database/entities/player.entity';
import { Match } from './database/entities/match.entity';
import { Notification } from './database/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Tournament, Team, Player, Match, Notification],
        synchronize: true, // Should be false in production
      }),
    }),
    AuthModule,
    TournamentsModule,
    MatchesModule,
    RealtimeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
