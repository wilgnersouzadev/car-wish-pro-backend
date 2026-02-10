import { IsString, IsNumber, IsEnum, IsOptional, Min, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RewardType } from "src/core/domain/entities/loyalty-program.entity";

export class CreateProgramDTO {
  @ApiProperty({ description: "Nome do programa de fidelidade" })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({ description: "Número de lavagens necessárias para ganhar recompensa", minimum: 1 })
  @IsNumber()
  @Min(1)
  washesRequired: number;

  @ApiProperty({
    description: "Tipo de recompensa",
    enum: RewardType,
    enumName: "RewardType",
  })
  @IsEnum(RewardType)
  rewardType: RewardType;

  @ApiPropertyOptional({
    description: "Valor da recompensa (obrigatório para desconto em porcentagem ou valor fixo)",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardValue?: number;
}
