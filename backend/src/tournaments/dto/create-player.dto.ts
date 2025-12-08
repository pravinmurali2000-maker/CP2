// backend/src/tournaments/dto/create-player.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  number: number;

  @IsString()
  @IsOptional()
  position?: string;
}
