import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { VehicleType } from "src/core/domain/entities/vehicle.entity";

export class CreateVehicleDTO {
  @ApiProperty({ example: "ABC1D23" })
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @ApiProperty({ example: "Honda Civic" })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: "Prata" })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  type: VehicleType;

  @ApiProperty({ example: 1, description: "ID do cliente (Customer)" })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;
}
