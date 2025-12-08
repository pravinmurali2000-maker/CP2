import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateScoreDto {
  @IsInt()
  @IsNotEmpty()
  home_score: number;

  @IsInt()
  @IsNotEmpty()
  away_score: number;
}
