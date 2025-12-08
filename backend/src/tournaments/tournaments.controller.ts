// backend/src/tournaments/tournaments.controller.ts
import { Controller, Get, Put, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { StandingsService } from './services/standings.service';
import { GenerateScheduleDto } from './dto/generate-schedule.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('api/tournaments')
export class TournamentsController {
  constructor(
      private readonly tournamentsService: TournamentsService,
      private readonly standingsService: StandingsService,
    ) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, updateTournamentDto);
  }

  @Post(':id/teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  createTeam(
    @Param('id', ParseIntPipe) id: number,
    @Body() createTeamDto: CreateTeamDto,
  ) {
    return this.tournamentsService.createTeam(id, createTeamDto);
  }

  @Post(':id/teams/:teamId/players')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  createPlayer(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() createPlayerDto: CreatePlayerDto,
  ) {
    return this.tournamentsService.createPlayer(teamId, createPlayerDto);
  }

  @Put(':id/teams/:teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Manager)
  updateTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.tournamentsService.updateTeam(teamId, updateTeamDto);
  }

  @Delete(':id/teams/:teamId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  deleteTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
  ) {
    return this.tournamentsService.deleteTeam(teamId);
  }

  @Post(':id/schedule/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  generateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() generateScheduleDto: GenerateScheduleDto,
  ) {
    return this.tournamentsService.generateSchedule(id, generateScheduleDto);
  }

  @Delete(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  clearSchedule(@Param('id', ParseIntPipe) id: number) {
    return this.tournamentsService.clearSchedule(id);
  }

  @Post(':id/notifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  createNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.tournamentsService.createNotification(id, createNotificationDto);
  }

  @Get(':id/standings')
  getStandings(@Param('id', ParseIntPipe) id: number) {
    return this.standingsService.calculate(id);
  }
}
