import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tournament } from 'src/database/entities/tournament.entity';
import { DataSource, Repository } from 'typeorm';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { UpdatePlayerDto } from './dto/update-player.dto'; // <-- Added
import { Team } from 'src/database/entities/team.entity';
import { Player } from 'src/database/entities/player.entity';
import { User } from 'src/database/entities/user.entity';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Match } from 'src/database/entities/match.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from 'src/database/entities/notification.entity';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/common/enums/role.enum';

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
      relations: ['teams', 'teams.players', 'teams.manager', 'matches', 'matches.home_team', 'matches.away_team', 'notifications'],
    });
    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return tournament;
  }

  async update(id: number, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
    const { startDate, endDate, ...rest } = updateTournamentDto;

    const tournamentData: Partial<Tournament> = rest;
    if (startDate) {
      tournamentData.start_date = startDate;
    }
    if (endDate) {
      tournamentData.end_date = endDate;
    }
    
    const tournament = await this.tournamentsRepository.preload({
      id: id,
      ...tournamentData,
    });

    if (!tournament) {
      throw new NotFoundException(`Tournament with ID ${id} not found`);
    }
    return this.tournamentsRepository.save(tournament);
  }

  async createTeam(tournamentId: number, createTeamDto: CreateTeamDto): Promise<Tournament> {
    console.log('--- createTeam method called ---');
    console.log('tournamentId:', tournamentId);
    console.log('createTeamDto:', createTeamDto);

    const tournament = await this.findOne(tournamentId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('createTeam: Before checking for existing user.');
      // Check if user with this email already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: createTeamDto.manager_email },
      });
      console.log('createTeam: After checking for existing user. Existing user:', existingUser);

      if (existingUser) {
        throw new BadRequestException(
          `A user with email ${createTeamDto.manager_email} already exists.`,
        );
      }

      console.log('createTeam: Before hashing password.');
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createTeamDto.password, saltRounds);
      console.log('createTeam: After hashing password.');

      console.log('createTeam: Before creating new manager.');
      // Create a new user for the manager
      const newManager = this.usersRepository.create({
        name: createTeamDto.manager_name,
        email: createTeamDto.manager_email,
        password_hash: hashedPassword,
        role: Role.Manager,
      });
      console.log('createTeam: Before saving new manager.');
      const savedManager = await queryRunner.manager.save(newManager);
      console.log('createTeam: After saving new manager. Saved manager:', savedManager);

      console.log('createTeam: Before creating new team.');
      const newTeam = this.teamsRepository.create({
        name: createTeamDto.name,
        tournament_id: tournament.id,
        manager_id: savedManager.id,
      });
      console.log('newTeam object before saving:', newTeam);
      console.log('createTeam: Before saving new team.');
      const savedTeam = await queryRunner.manager.save(newTeam);
      console.log('createTeam: After saving new team. Saved team:', savedTeam);

      if (createTeamDto.players && createTeamDto.players.length > 0) {
        const playersToSave = createTeamDto.players.map(playerDto => 
          this.playersRepository.create({
            ...playerDto,
            team_id: savedTeam.id,
          })
        );
        console.log('createTeam: Before saving players.');
        await queryRunner.manager.save(playersToSave);
        console.log('createTeam: After saving players.');
      }

      console.log('createTeam: Before committing transaction.');
      await queryRunner.commitTransaction();
      console.log('createTeam: After committing transaction.');
      
      console.log('createTeam: Before calling findOne to return tournament.');
      const finalTournament = await this.findOne(tournamentId);
      console.log('createTeam: After calling findOne. Returning tournament.');
      return finalTournament;

    } catch (err) {
      console.error('createTeam: Error in transaction:', err);
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Failed to create team. Transaction rolled back.');
    } finally {
      console.log('createTeam: Releasing query runner.');
      await queryRunner.release();
      console.log('createTeam: Query runner released.');
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

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto): Promise<Tournament> {
    return this.dataSource.transaction(async manager => {
      const team = await manager.findOne(Team, {
        where: { id: teamId },
        relations: ['manager'],
      });

      if (!team) {
        throw new NotFoundException(`Team with ID ${teamId} not found`);
      }

      const { name, manager_name, manager_email } = updateTeamDto;

      if (name) {
        team.name = name;
      }

      let managerNeedsUpdate = false;
      let managerUser: User | null = null; // Renamed for clarity and to avoid confusion

      // Case 1: Team currently has no manager, but DTO provides manager details
      if (!team.manager && manager_name && manager_email) {
        const existingUser = await manager.findOne(User, { where: { email: manager_email } });
        if (existingUser) {
          throw new BadRequestException(`Email ${manager_email} is already in use by another user.`);
        }
        
        // Create a new manager user
        managerUser = this.usersRepository.create({
          name: manager_name,
          email: manager_email,
          password_hash: 'placeholder', 
          role: Role.Manager,
        });
        await manager.save(managerUser);
        team.manager = managerUser; // Link the new manager to the team
        team.manager_id = managerUser.id;
        managerNeedsUpdate = true;
      } 
      // Case 2: Team has an existing manager, and DTO provides updates
      else if (team.manager) {
        managerUser = team.manager; // Assign existing manager to managerUser
        let updateMadeToManager = false;

        // Update name if manager_name is explicitly provided in the DTO and is a non-empty string
        if (updateTeamDto.manager_name !== undefined && updateTeamDto.manager_name !== null && updateTeamDto.manager_name.trim() !== '') {
          managerUser.name = updateTeamDto.manager_name;
          updateMadeToManager = true;
        }

        // Update email if manager_email is explicitly provided in the DTO and is a non-empty string
        if (updateTeamDto.manager_email !== undefined && updateTeamDto.manager_email !== null && updateTeamDto.manager_email.trim() !== '') {
          // Check for email collision only if email is provided and differs
          if (managerUser.email !== updateTeamDto.manager_email) {
            const existingUser = await manager.findOne(User, { where: { email: updateTeamDto.manager_email } });
            if (existingUser && existingUser.id !== managerUser.id) {
              throw new BadRequestException(`Email ${updateTeamDto.manager_email} is already in use by another user.`);
            }
          }
          managerUser.email = updateTeamDto.manager_email;
          updateMadeToManager = true;
        }
        managerNeedsUpdate = updateMadeToManager;
      }
      
      if (managerNeedsUpdate && managerUser) {
        await manager.save(managerUser);
      }
      
      await manager.save(team);

      return this.findOne(team.tournament_id);
    });
  }

  async deleteTeam(teamId: number): Promise<Tournament> {
    const team = await this.teamsRepository.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    const tournamentId = team.tournament_id;
    await this.teamsRepository.delete(teamId);
    return this.findOne(tournamentId);
  }

  async updatePlayer(
    teamId: number,
    playerId: number,
    updatePlayerDto: UpdatePlayerDto,
  ): Promise<Tournament> {
    const player = await this.playersRepository.findOne({
      where: { id: playerId, team_id: teamId },
    });

    if (!player) {
      throw new NotFoundException(
        `Player with ID ${playerId} not found in team ${teamId}`,
      );
    }

    const updatedPlayer = await this.playersRepository.preload({
      id: playerId,
      ...updatePlayerDto,
    });

    await this.playersRepository.save(updatedPlayer);

    // After updating player, return the updated tournament data
    const team = await this.teamsRepository.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return this.findOne(team.tournament_id);
  }

  async deletePlayer(teamId: number, playerId: number): Promise<Tournament> {
    const player = await this.playersRepository.findOne({
      where: { id: playerId, team_id: teamId },
    });

    if (!player) {
      throw new NotFoundException(
        `Player with ID ${playerId} not found in team ${teamId}`,
      );
    }

    await this.playersRepository.remove(player);

    // After deleting player, return the updated tournament data
    const team = await this.teamsRepository.findOneBy({ id: teamId });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }
    return this.findOne(team.tournament_id);
  }

  async generateSchedule(tournamentId: number, scheduleDto: GenerateScheduleDto): Promise<Tournament> {
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
    await this.matchesRepository.save(matchEntities);
    return this.findOne(tournamentId);
  }

  async clearSchedule(tournamentId: number): Promise<Tournament> {
    await this.matchesRepository.delete({ tournament_id: tournamentId });
    return this.findOne(tournamentId);
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

  async deleteNotification(tournamentId: number, notificationId: number): Promise<Tournament> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, tournament_id: tournamentId },
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID ${notificationId} not found in tournament ${tournamentId}`,
      );
    }

    await this.notificationsRepository.remove(notification);

    const updatedTournament = await this.findOne(tournamentId);
    this.realtimeGateway.broadcastTournamentUpdate(tournamentId, updatedTournament);
    
    return updatedTournament;
  }
}

