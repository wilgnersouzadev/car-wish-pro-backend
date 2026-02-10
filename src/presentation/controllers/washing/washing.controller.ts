import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { UpdatePaymentDto } from "src/presentation/dtos/washing/update-payment.dto";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { PaginationDTO } from "src/presentation/dtos/pagination/pagination.dto";
import { PaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

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
    @Query() pagination?: PaginationDTO,
  ): Promise<PaginatedResponse<CarWash> | CarWash[]> {
    if (startDate && endDate && shopId) {
      return await this.carWashService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        shopId,
      );
    }
    return await this.carWashService.findAll(shopId, pagination?.page, pagination?.limit);
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

  @Patch(":id/payment")
  @ApiOperation({
    summary: "Atualizar pagamento manual",
    description:
      "Registra/atualiza valor pago, forma de pagamento e status. Sem integração com gateway.",
  })
  async updatePayment(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
    @ShopId() shopId: number,
  ): Promise<CarWash> {
    return await this.carWashService.updatePayment(
      id,
      {
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        paymentStatus: dto.paymentStatus,
      },
      shopId,
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover lavagem" })
  async remove(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<void> {
    return await this.carWashService.remove(id, shopId);
  }
}
