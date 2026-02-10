import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({ example: "Lavagem Completa" })
  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @ApiProperty({ example: "2026-02-15" })
  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @ApiProperty({ example: "10:00" })
  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @ApiProperty({ example: "Cliente prefere cera extra", required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
