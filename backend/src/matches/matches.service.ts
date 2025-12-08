import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from 'src/database/entities/match.entity';
import { Repository } from 'typeorm';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { StandingsService } from 'src/tournaments/services/standings.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    private readonly standingsService: StandingsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async updateMatch(id: number, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.matchesRepository.preload({
      id: id,
      ...updateMatchDto,
    });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    return this.matchesRepository.save(match);
  }

  async updateScore(id: number, updateScoreDto: UpdateScoreDto): Promise<Match> {
    const match = await this.matchesRepository.findOneBy({ id });
    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    match.home_score = updateScoreDto.home_score;
    match.away_score = updateScoreDto.away_score;
    match.status = MatchStatus.Completed;
    await this.matchesRepository.save(match);

    // After updating the score, trigger the standings recalculation
    const newStandings = await this.standingsService.calculate(match.tournament_id);

    // Broadcast the update via WebSocket
    this.realtimeGateway.broadcastScoreUpdate(match.tournament_id, newStandings);

    return match;
  }
}
