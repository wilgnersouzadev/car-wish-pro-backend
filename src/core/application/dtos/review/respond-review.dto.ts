import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RespondReviewDto {
  @ApiProperty({ description: "Resposta da loja" })
  @IsString()
  response: string;
}
