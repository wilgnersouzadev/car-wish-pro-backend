import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDTO {
  @ApiProperty({ example: "Maria Oliveira" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "+55 11 99999-9999" })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: "Cliente prefere lavagem completa às sextas." })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isFrequentCustomer?: boolean;
}

