// backend/src/tournaments/dto/update-team.dto.ts
import { IsString, IsOptional, IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  manager_name?: string;

  @IsOptional()
  @IsEmail()
  manager_email?: string;
}
