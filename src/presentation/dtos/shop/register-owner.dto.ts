import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterOwnerDTO {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: "joao@lava-jato.com" })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @ApiProperty({ example: "senha123", minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  ownerPassword: string;

  @ApiProperty({ example: "Lava Jato Central" })
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @ApiProperty({ example: "lava-jato-central" })
  @IsString()
  @IsNotEmpty()
  shopSlug: string;
}
