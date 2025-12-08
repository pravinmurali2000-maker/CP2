import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/database/entities/match.entity';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { RealtimeModule } from 'src/realtime/realtime.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    AuthModule,
    TournamentsModule, // To access StandingsService
    RealtimeModule, // To access RealtimeGateway
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
})
export class MatchesModule {}
