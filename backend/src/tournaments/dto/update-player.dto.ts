// backend/src/tournaments/dto/update-player.dto.ts
import { IsString, IsOptional, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class UpdatePlayerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  number?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  position?: string;
}
