import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";
import { UserRole, CommissionType } from "src/core/domain/entities/user.entity";

export class CreateUserDTO {
  @ApiProperty({ example: "Wilgner Souza", description: "Nome do usuário" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "wilgner@email.com", description: "Email único do usuário" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "Test123!", description: "Senha (mínimo 6 caracteres)", minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: "A senha deve ter no mínimo 6 caracteres" })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.EMPLOYEE, description: "Papel: admin ou employee" })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ default: true, description: "Se o usuário está ativo" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: CommissionType, description: "Tipo de comissão (obrigatório se role = employee)" })
  @ValidateIf((o) => o.role === UserRole.EMPLOYEE)
  @IsEnum(CommissionType)
  @IsNotEmpty({ message: "Comissão é obrigatória para funcionários" })
  commissionType?: CommissionType;

  @ApiPropertyOptional({ description: "Valor da comissão (obrigatório se role = employee)" })
  @ValidateIf((o) => o.role === UserRole.EMPLOYEE)
  @IsNumber()
  @IsNotEmpty({ message: "Valor da comissão é obrigatório para funcionários" })
  commissionValue?: number;
}
