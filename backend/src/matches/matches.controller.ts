import { Controller, Post, Put, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UpdateScoreDto } from './dto/update-score.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('api/matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post(':id/score')
  @Roles(Role.Admin)
  updateScore(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScoreDto: UpdateScoreDto,
  ) {
    return this.matchesService.updateScore(id, updateScoreDto);
  }

  @Put(':id')
  @Roles(Role.Admin)
  updateMatch(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return this.matchesService.updateMatch(id, updateMatchDto);
  }
}
