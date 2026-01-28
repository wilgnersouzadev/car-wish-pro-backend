import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, ServiceType } from "src/core/domain/entities/car-wash.entity";

export class CreateCarWashDTO {
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  employeeIds: number[];

  @IsString()
  @IsOptional()
  notes?: string;
}
