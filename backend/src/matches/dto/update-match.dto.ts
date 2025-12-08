// backend/src/matches/dto/update-match.dto.ts
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateMatchDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsString()
  venue?: string;
}
