import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { VehicleType } from "src/core/domain/entities/vehicle.entity";

export class CreateVehicleDTO {
  @IsString()
  @IsNotEmpty()
  licensePlate: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsEnum(VehicleType)
  @IsNotEmpty()
  type: VehicleType;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;
}
