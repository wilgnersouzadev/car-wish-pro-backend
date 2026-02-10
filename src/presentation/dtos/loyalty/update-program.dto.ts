import { PartialType } from "@nestjs/swagger";
import { CreateProgramDTO } from "./create-program.dto";

export class UpdateProgramDTO extends PartialType(CreateProgramDTO) {}
