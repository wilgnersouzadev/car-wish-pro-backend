import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CommissionType } from "src/core/domain/entities/employee.entity";

export class CreateEmployeeDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(CommissionType)
  @IsNotEmpty()
  commissionType: CommissionType;

  @IsNumber()
  @IsNotEmpty()
  commissionValue: number;
}
