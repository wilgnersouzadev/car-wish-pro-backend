import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { PaymentMethod, PaymentStatus } from "src/core/domain/entities/car-wash.entity";

export class UpdatePaymentDto {
  @ApiPropertyOptional({ description: "Valor pago (atualização manual)" })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentStatus, description: "paid = pago, pending = pendente" })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
