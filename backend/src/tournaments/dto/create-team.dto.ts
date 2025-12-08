// backend/src/tournaments/dto/create-team.dto.ts
import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlayerDto } from './create-player.dto';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  manager_name: string;

  @IsEmail()
  @IsNotEmpty()
  manager_email: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlayerDto)
  players?: CreatePlayerDto[];
}
