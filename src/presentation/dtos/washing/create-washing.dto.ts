import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, ServiceType } from "src/core/domain/entities/car-wash.entity";

export class CreateCarWashDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  vehicleId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;

  @ApiProperty({ enum: ServiceType, example: ServiceType.FULL })
  @IsEnum(ServiceType)
  @IsNotEmpty()
  serviceType: ServiceType;

  @ApiProperty({ example: 80.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.PIX })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    example: [2, 3],
    description: "IDs dos funcionários (Users com role=employee) que participaram da lavagem",
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  employeeIds: number[];

  @ApiPropertyOptional({ example: "Cliente pediu atenção especial nos tapetes." })
  @IsString()
  @IsOptional()
  notes?: string;
}
