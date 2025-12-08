// backend/src/tournaments/dto/generate-schedule.dto.ts
import { IsDateString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class GenerateScheduleDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsNumber()
  @Min(1)
  matchesPerDay: number;

  @IsNumber()
  @Min(1)
  timeSlotInterval: number; // in minutes
}
