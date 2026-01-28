import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class CreateShopDTO {
  @ApiProperty({ example: "Lava Jato Central" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "lava-jato-central", description: "Slug único (apenas letras, números e hífens)" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: "Slug deve conter apenas letras minúsculas, números e hífens" })
  @MinLength(3)
  slug: string;
}
