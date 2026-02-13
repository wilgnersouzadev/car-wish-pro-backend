import { IsInt, IsString, IsOptional, Min, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty({ description: "ID da lavagem" })
  @IsInt()
  carWashId: number;

  @ApiProperty({ description: "Nota de 1 a 5", minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: "Comentário do cliente", required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
