import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from 'src/database/entities/match.entity';
import { Team } from 'src/database/entities/team.entity';
import { Repository } from 'typeorm';

export interface Standing {
  teamId: number;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  async calculate(tournamentId: number): Promise<Standing[]> {
    const teams = await this.teamsRepository.find({ where: { tournament_id: tournamentId } });
    const matches = await this.matchesRepository.find({
      where: { tournament_id: tournamentId, status: MatchStatus.Completed },
    });

    const standingsMap: Map<number, Standing> = new Map(
      teams.map((team) => [
        team.id,
        {
          teamId: team.id,
          teamName: team.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        },
      ]),
    );

    for (const match of matches) {
      const homeTeamStanding = standingsMap.get(match.home_team_id);
      const awayTeamStanding = standingsMap.get(match.away_team_id);

      if (homeTeamStanding && awayTeamStanding && match.home_score != null && match.away_score != null) {
        // Update stats for both teams
        homeTeamStanding.played++;
        awayTeamStanding.played++;
        homeTeamStanding.goalsFor += match.home_score;
        awayTeamStanding.goalsFor += match.away_score;
        homeTeamStanding.goalsAgainst += match.away_score;
        awayTeamStanding.goalsAgainst += match.home_score;

        // Determine winner, loser, or draw
        if (match.home_score > match.away_score) {
          homeTeamStanding.won++;
          homeTeamStanding.points += 3;
          awayTeamStanding.lost++;
        } else if (match.home_score < match.away_score) {
          awayTeamStanding.won++;
          awayTeamStanding.points += 3;
          homeTeamStanding.lost++;
        } else {
          homeTeamStanding.drawn++;
          awayTeamStanding.drawn++;
          homeTeamStanding.points += 1;
          awayTeamStanding.points += 1;
        }
      }
    }

    const standings = Array.from(standingsMap.values());

    // Calculate goal difference
    for (const standing of standings) {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    }

    // Sort standings based on tie-breaker logic
    standings.sort((a, b) => {
      // 1. Points
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // 2. Goal Difference
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      // 3. Goals For
      return b.goalsFor - a.goalsFor;
    });

    return standings;
  }
}
