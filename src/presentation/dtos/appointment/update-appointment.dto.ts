import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { AppointmentStatus } from "../../../core/domain/entities/appointment.entity";

export class UpdateAppointmentDto {
  @ApiProperty({ example: "Lavagem Premium", required: false })
  @IsString()
  @IsOptional()
  serviceType?: string;

  @ApiProperty({ example: "2026-02-15", required: false })
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @ApiProperty({ example: "14:00", required: false })
  @IsString()
  @IsOptional()
  scheduledTime?: string;

  @ApiProperty({ example: "confirmed", enum: AppointmentStatus, required: false })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiProperty({ example: "Observações atualizadas", required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
