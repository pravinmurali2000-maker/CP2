import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament } from 'src/database/entities/tournament.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from 'src/database/entities/team.entity';
import { Player } from 'src/database/entities/player.entity';
import { User } from 'src/database/entities/user.entity';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Match } from 'src/database/entities/match.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from 'src/database/entities/notification.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private tournamentsRepository: Repository<Tournament>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(Player)
    private playersRepository: Repository<Player>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private dataSource: DataSource,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findOne(id: number): Promise<Tournament> {
    const tournament = await this.tournamentsRepository.findOne({
      where: { id },
      relations: ['teams', 'teams.players', 'matches', 'matches.home_team', 'matches.away_team', 'notifications'],
    });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async update(id: number, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.tournamentsRepository.preload({
      id: id,
      ...updateTournamentDto,
    });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return this.tournamentsRepository.save(tournament);
  }

  async createTeam(tournamentId: number, createTeamDto: CreateTeamDto): Promise<Team> {
    console.log('--- createTeam method called ---');
    console.log('tournamentId:', tournamentId);
    console.log('createTeamDto:', createTeamDto);

    const tournament = await this.findOne(tournamentId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newTeam = this.teamsRepository.create({
        name: createTeamDto.name,
        manager_name: createTeamDto.manager_name,
        manager_email: createTeamDto.manager_email,
        tournament_id: tournament.id,
      });
      console.log('newTeam object before saving:', newTeam);
      const savedTeam = await queryRunner.manager.save(newTeam);

      if (createTeamDto.players && createTeamDto.players.length > 0) {
        const playersToSave = createTeamDto.players.map(playerDto => 
          this.playersRepository.create({
            ...playerDto,
            team_id: savedTeam.id,
          })
        );
        await queryRunner.manager.save(playersToSave);
      }

      await queryRunner.commitTransaction();
      
      return await this.teamsRepository.findOneOrFail({ 
        where: { id: savedTeam.id },
        relations: ['players'],
      });

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to create team. Transaction rolled back.');
    } finally {
      await queryRunner.release();
    }
  }

  async createPlayer(teamId: number, createPlayerDto: CreatePlayerDto): Promise<Player> {
    console.log('--- createPlayer method called ---');
    console.log('teamId:', teamId);
    console.log('createPlayerDto:', createPlayerDto);

    const team = await this.teamsRepository.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const newPlayer = this.playersRepository.create({
      ...createPlayerDto,
      team_id: teamId,
    });
    console.log('newPlayer object before saving:', newPlayer);

    return this.playersRepository.save(newPlayer);
  }

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamsRepository.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    // If manager_email is being updated, also update the associated user's email
    if (updateTeamDto.manager_email && updateTeamDto.manager_email !== team.manager_email) {
      const user = await this.usersRepository.findOneBy({ email: team.manager_email });
      if (user) {
        user.email = updateTeamDto.manager_email;
        await this.usersRepository.save(user);
      } else {
        // Handle case where user not found, e.g., create a new user or log a warning
        // For now, we'll just log a warning and proceed with team update
        console.warn(`User with email ${team.manager_email} not found for team ${teamId}. Only team's manager_email will be updated.`);
      }
    }

    const updatedTeam = await this.teamsRepository.preload({
      id: teamId,
      ...updateTeamDto,
    });

    return this.teamsRepository.save(updatedTeam);
  }

  async deleteTeam(teamId: number): Promise<{ deleted: boolean; affected?: number }> {
    const result = await this.teamsRepository.delete(teamId);
    if (result.affected === 0) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return { deleted: true, affected: result.affected };
  }

  async generateSchedule(tournamentId: number, scheduleDto: GenerateScheduleDto): Promise<Match[]> {
    const tournament = await this.findOne(tournamentId);
    if (tournament.teams.length < 2) {
      throw new BadRequestException('Not enough teams to generate a schedule. Need at least 2.');
    }

    await this.clearSchedule(tournamentId);

    let teams = [...tournament.teams];
    if (teams.length % 2 !== 0) {
      teams.push({ id: -1, name: 'BYE' } as Team);
    }

    const numRounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;
    const newMatches: Partial<Match>[] = [];

    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = teams[i];
        const away = teams[teams.length - 1 - i];

        if (home.id !== -1 && away.id !== -1) {
          newMatches.push({
            home_team_id: home.id,
            away_team_id: away.id,
            tournament_id: tournamentId,
          });
        }
      }
      teams.splice(1, 0, teams.pop()!);
    }

    const { startDate, matchesPerDay, timeSlotInterval } = scheduleDto;
    let currentDate = new Date(startDate);
    let matchesToday = 0;

    for (const match of newMatches) {
      if (matchesToday >= matchesPerDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        matchesToday = 0;
      }
      
      const matchTime = new Date(currentDate);
      matchTime.setMinutes(matchTime.getMinutes() + matchesToday * timeSlotInterval);

      match.date = currentDate.toISOString().split('T')[0];
      match.time = matchTime.toTimeString().split(' ')[0];
      
      matchesToday++;
    }

    const matchEntities = this.matchesRepository.create(newMatches);
    return this.matchesRepository.save(matchEntities);
  }

  async clearSchedule(tournamentId: number): Promise<{ deleted: number }> {
    const result = await this.matchesRepository.delete({ tournament_id: tournamentId });
    return { deleted: result.affected || 0 };
  }

  async createNotification(tournamentId: number, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const tournament = await this.findOne(tournamentId);
    const newNotification = this.notificationsRepository.create({
      ...createNotificationDto,
      tournament_id: tournament.id,
    });
    
    const savedNotification = await this.notificationsRepository.save(newNotification);

    this.realtimeGateway.broadcastNotification(tournamentId, savedNotification);

    return savedNotification;
  }
}

