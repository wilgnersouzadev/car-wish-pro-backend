import { IsNotEmpty, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AvailableSlotsDto {
  @ApiProperty({ example: "2026-02-15" })
  @IsDateString()
  @IsNotEmpty()
  date: string;
}
