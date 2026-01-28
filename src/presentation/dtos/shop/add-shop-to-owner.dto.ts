import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty } from "class-validator";

export class AddShopToOwnerDTO {
  @ApiProperty({ example: 1, description: "ID do admin para vincular à loja" })
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;
}
