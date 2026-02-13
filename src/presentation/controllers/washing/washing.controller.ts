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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { UpdatePaymentDto } from "src/presentation/dtos/washing/update-payment.dto";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { PaginationDTO } from "src/presentation/dtos/pagination/pagination.dto";
import { PaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";
import { NotificationService } from "src/core/application/services/notification/notification.service";
import { NotificationType } from "src/core/domain/entities/notification.entity";

@ApiTags("Car Washes")
@Controller("car-washes")
@ApiBearerAuth()
export class WashingController {
  constructor(
    private readonly carWashService: CarWashService,
    private readonly notificationService: NotificationService,
  ) {}

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
  @ApiQuery({ name: "search", required: false, description: "Busca por placa, modelo do veículo ou nome do cliente (ILIKE)" })
  @ApiQuery({ name: "startDate", required: false, description: "Data inicial para filtro (ISO 8601)" })
  @ApiQuery({ name: "endDate", required: false, description: "Data final para filtro (ISO 8601)" })
  @ApiQuery({ name: "status", required: false, description: "Filtro por status de pagamento (paid, pending)" })
  @ApiQuery({ name: "serviceType", required: false, description: "Filtro por tipo de serviço (basic, full, polish)" })
  @ApiQuery({ name: "sortBy", required: false, description: "Campo para ordenação (dateTime, amount, etc)" })
  @ApiQuery({ name: "sortOrder", required: false, description: "Ordem de ordenação (ASC ou DESC)" })
  async findAll(
    @ShopId() shopId: number,
    @Query("search") search?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("status") status?: string,
    @Query("serviceType") serviceType?: string,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "ASC" | "DESC",
    @Query() pagination?: PaginationDTO,
  ): Promise<PaginatedResponse<CarWash>> {
    return await this.carWashService.findAll(
      shopId,
      pagination?.page,
      pagination?.limit,
      search,
      startDate,
      endDate,
      status,
      serviceType,
      sortBy,
      sortOrder,
    );
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
    @Body("sendNotification") sendNotification: boolean,
    @Body("notificationType") notificationType: NotificationType,
    @ShopId() shopId: number,
  ): Promise<CarWash> {
    const carWash = await this.carWashService.updateStatus(id, status, shopId);

    if (sendNotification && status === "paid") {
      try {
        await this.notificationService.sendWashCompletedNotification(
          carWash,
          notificationType || NotificationType.WHATSAPP,
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    return carWash;
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
