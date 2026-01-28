import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class LoginDTO {
  @ApiProperty({ example: "admin@loja.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "senha123" })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 1, description: "ID da loja para usar no contexto (apenas para admins com múltiplas lojas)" })
  @IsNumber()
  @IsOptional()
  shopId?: number;
}
