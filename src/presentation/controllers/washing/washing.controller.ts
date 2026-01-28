import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { CarWash } from "src/core/domain/entities/car-wash.entity";

@ApiTags("Car Washes")
@Controller("car-washes")
export class WashingController {
  constructor(private readonly carWashService: CarWashService) {}

  @Post()
  @ApiOperation({ summary: "Registrar nova lavagem" })
  async create(@Body() createCarWashDTO: CreateCarWashDTO): Promise<CarWash> {
    return await this.carWashService.create(createCarWashDTO);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas as lavagens" })
  async findAll(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<CarWash[]> {
    if (startDate && endDate) {
      return await this.carWashService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
      );
    }
    return await this.carWashService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar lavagem por ID" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<CarWash> {
    return await this.carWashService.findOne(id);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Atualizar status de pagamento" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: "paid" | "pending",
  ): Promise<CarWash> {
    return await this.carWashService.updateStatus(id, status);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover lavagem" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.carWashService.remove(id);
  }
}
