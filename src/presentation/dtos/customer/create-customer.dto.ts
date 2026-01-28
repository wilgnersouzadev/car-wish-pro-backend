import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCustomerDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isFrequentCustomer?: boolean;
}

