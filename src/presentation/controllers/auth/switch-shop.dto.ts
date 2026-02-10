import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class SwitchShopDTO {
  @ApiProperty({ example: 1, description: "ID da loja para trocar o contexto (null para visão geral)", nullable: true })
  @IsNumber()
  @IsOptional()
  shopId: number | null;
}
