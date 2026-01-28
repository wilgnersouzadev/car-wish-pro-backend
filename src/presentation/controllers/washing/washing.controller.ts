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
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";

@ApiTags("Car Washes")
@Controller("car-washes")
@ApiBearerAuth()
export class WashingController {
  constructor(private readonly carWashService: CarWashService) {}

  @Post()
  @ApiOperation({ summary: "Registrar nova lavagem" })
  async create(
    @Body() createCarWashDTO: CreateCarWashDTO,
    @ShopId() shopId: number,
  ): Promise<CarWash> {
    return await this.carWashService.create(createCarWashDTO, shopId);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas as lavagens da loja" })
  async findAll(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @ShopId() shopId?: number,
  ): Promise<CarWash[]> {
    if (startDate && endDate && shopId) {
      return await this.carWashService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        shopId,
      );
    }
    return await this.carWashService.findAll(shopId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar lavagem por ID" })
  async findOne(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<CarWash> {
    return await this.carWashService.findOne(id, shopId);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Atualizar status de pagamento" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: "paid" | "pending",
    @ShopId() shopId: number,
  ): Promise<CarWash> {
    return await this.carWashService.updateStatus(id, status, shopId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover lavagem" })
  async remove(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<void> {
    return await this.carWashService.remove(id, shopId);
  }
}
