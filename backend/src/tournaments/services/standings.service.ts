import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from 'src/database/entities/team.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async getStandings(tournamentId: number): Promise<Team[]> {
    const teams = await this.teamsRepository.find({
      where: { tournament_id: tournamentId },
      order: {
        points: 'DESC',
        goalDifference: 'DESC',
        goalsFor: 'DESC',
      },
    });

    return teams;
  }
}
