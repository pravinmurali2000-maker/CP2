import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from 'src/database/entities/team.entity';
import { Match } from 'src/database/entities/match.entity';
import { StandingsService } from './services/standings.service';
import { Tournament } from 'src/database/entities/tournament.entity';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { Player } from 'src/database/entities/player.entity';
import { Notification } from 'src/database/entities/notification.entity';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { User } from 'src/database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, Team, Match, Player, Notification, User]),
    RealtimeModule,
  ],
  controllers: [TournamentsController],
  providers: [StandingsService, TournamentsService],
  exports: [StandingsService, TournamentsService],
})
export class TournamentsModule {}
