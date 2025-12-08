// backend/src/tournaments/dto/create-notification.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NotificationPriority } from 'src/database/entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;
}
