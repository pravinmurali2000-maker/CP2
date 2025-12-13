import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from 'src/database/entities/match.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { StandingsService } from 'src/tournaments/services/standings.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { Tournament } from 'src/database/entities/tournament.entity';
import { Team } from 'src/database/entities/team.entity';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private readonly standingsService: StandingsService,
    private readonly tournamentsService: TournamentsService,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly dataSource: DataSource,
  ) {}

  async updateMatch(id: number, updateMatchDto: UpdateMatchDto): Promise<Tournament> {
    const match = await this.matchesRepository.preload({
      id: id,
      ...updateMatchDto,
    });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    await this.matchesRepository.save(match);
    const updatedTournament = await this.tournamentsService.findOne(match.tournament_id);
    this.realtimeGateway.broadcastTournamentUpdate(match.tournament_id, updatedTournament);
    return updatedTournament;
  }

  async updateScore(id: number, updateScoreDto: UpdateScoreDto): Promise<Tournament> {
    return this.dataSource.transaction(async manager => {
      const match = await manager.findOne(Match, { 
        where: { id },
        relations: ['home_team', 'away_team'],
      });
      if (!match) {
        throw new NotFoundException(`Match with ID ${id} not found`);
      }

      const { home_team, away_team } = match;
      const oldHomeScore = match.home_score;
      const oldAwayScore = match.away_score;
      const wasCompleted = match.status === MatchStatus.Completed;

      // Revert stats if the match was already completed
      if (wasCompleted && oldHomeScore !== null && oldAwayScore !== null) {
        this.updateTeamStats(home_team, away_team, oldHomeScore, oldAwayScore, true);
      }
      
      match.home_score = updateScoreDto.home_score;
      match.away_score = updateScoreDto.away_score;
      match.status = MatchStatus.Completed;
      await manager.save(match);

      // Apply new stats
      this.updateTeamStats(home_team, away_team, match.home_score, match.away_score);
      
      await manager.save([home_team, away_team]);

      const updatedTournament = await this.tournamentsService.findOne(match.tournament_id);
      this.realtimeGateway.broadcastTournamentUpdate(match.tournament_id, updatedTournament);

      return updatedTournament;
    });
  }

  private updateTeamStats(
    homeTeam: Team,
    awayTeam: Team,
    homeScore: number,
    awayScore: number,
    revert = false,
  ) {
    const factor = revert ? -1 : 1;

    homeTeam.played += factor;
    awayTeam.played += factor;
    homeTeam.goalsFor += homeScore * factor;
    awayTeam.goalsFor += awayScore * factor;
    homeTeam.goalsAgainst += awayScore * factor;
    awayTeam.goalsAgainst += homeScore * factor;
    homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
    awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;

    if (homeScore > awayScore) {
      homeTeam.won += factor;
      homeTeam.points += 3 * factor;
      awayTeam.lost += factor;
    } else if (homeScore < awayScore) {
      awayTeam.won += factor;
      awayTeam.points += 3 * factor;
      homeTeam.lost += factor;
    } else {
      homeTeam.drawn += factor;
      awayTeam.drawn += factor;
      homeTeam.points += 1 * factor;
      awayTeam.points += 1 * factor;
    }
  }
}
