import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class SwitchShopDTO {
  @ApiProperty({ example: 1, description: "ID da loja para trocar o contexto" })
  @IsNumber()
  @IsNotEmpty()
  shopId: number;
}
